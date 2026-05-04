'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { personas } from '@/lib/personas'
import type { CallType } from '@/lib/personas'
import type { TranscriptEntry } from '@/app/api/grade/route'

type CallState = 'idle' | 'connecting' | 'active' | 'ending'

function SpeakingIndicator() {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="speaking-bar w-0.5 rounded-full"
          style={{ background: 'var(--accent)', height: '100%' }}
        />
      ))}
    </div>
  )
}

export default function CallPage() {
  const params = useParams()
  const router = useRouter()
  const personaId = params.personaId as string
  const callType = params.callType as CallType

  const persona = personas.find((p) => p.id === personaId)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const transcriptRef = useRef<TranscriptEntry[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [callState, setCallState] = useState<CallState>('idle')
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [whoIsSpeaking, setWhoIsSpeaking] = useState<'user' | 'assistant' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const transcriptEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const addTranscriptEntry = useCallback((role: 'user' | 'assistant', content: string) => {
    if (!content.trim()) return
    const entry: TranscriptEntry = { role, content }
    transcriptRef.current = [...transcriptRef.current, entry]
    setTranscript([...transcriptRef.current])
  }, [])

  const handleRealtimeEvent = useCallback((event: Record<string, unknown>) => {
    switch (event.type) {
      case 'response.audio_transcript.done': {
        const t = event.transcript as string | undefined
        if (t) addTranscriptEntry('assistant', t)
        setWhoIsSpeaking(null)
        break
      }
      case 'response.audio.delta':
        setWhoIsSpeaking('assistant')
        break
      case 'response.audio.done':
        setWhoIsSpeaking(null)
        break
      case 'conversation.item.input_audio_transcription.completed': {
        const t = event.transcript as string | undefined
        if (t) addTranscriptEntry('user', t)
        break
      }
      case 'input_audio_buffer.speech_started':
        setWhoIsSpeaking('user')
        break
      case 'input_audio_buffer.speech_stopped':
        setWhoIsSpeaking(null)
        break
    }
  }, [addTranscriptEntry])

  async function startCall() {
    if (!persona) return
    setCallState('connecting')
    setError(null)

    try {
      // Get ephemeral token
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId, callType }),
      })
      if (!res.ok) throw new Error('Failed to create session')
      const data = await res.json()
      const ephemeralKey: string = data.client_secret?.value
      if (!ephemeralKey) throw new Error('No ephemeral key returned')

      // Create peer connection
      const pc = new RTCPeerConnection()
      pcRef.current = pc

      // Audio output element — must be in DOM for autoplay to work
      const audio = document.createElement('audio')
      audio.autoplay = true
      audio.style.display = 'none'
      document.body.appendChild(audio)
      audioRef.current = audio
      pc.ontrack = (e) => { audio.srcObject = e.streams[0] }

      // Mic input
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      // Data channel for events
      const dc = pc.createDataChannel('oai-events')
      dcRef.current = dc
      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data)
          handleRealtimeEvent(event)
        } catch {
          // ignore parse errors
        }
      }

      // Create and set offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Connect to OpenAI Realtime
      const sdpRes = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview', {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
      })
      if (!sdpRes.ok) throw new Error('Failed to connect to Realtime API')

      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: await sdpRes.text(),
      }
      await pc.setRemoteDescription(answer)

      setCallState('active')
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setCallState('idle')
    }
  }

  async function endCall() {
    setCallState('ending')
    if (timerRef.current) clearInterval(timerRef.current)

    // Stop all tracks and remove audio element
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    dcRef.current?.close()
    pcRef.current?.close()
    if (audioRef.current) {
      audioRef.current.srcObject = null
      audioRef.current.remove()
    }

    // Store transcript for debrief
    sessionStorage.setItem('callTranscript', JSON.stringify(transcriptRef.current))
    sessionStorage.setItem('callPersonaId', personaId)
    sessionStorage.setItem('callType', callType)

    router.push('/debrief')
  }

  function toggleMute() {
    localStreamRef.current?.getTracks().forEach((t) => {
      t.enabled = !t.enabled
    })
    setIsMuted((m) => !m)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      pcRef.current?.close()
    }
  }, [])

  if (!persona) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <p>Persona not found. <button onClick={() => router.push('/')} style={{ color: 'var(--accent)' }}>Go back</button></p>
      </div>
    )
  }

  const callTypeLabel = callType === 'discovery' ? 'Discovery Call' : 'Demo Call'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => router.push('/')}
          className="text-sm flex items-center gap-1.5 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Back
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            {callTypeLabel} · {persona.name}
          </div>
          {callState === 'active' && (
            <div className="text-xs" style={{ color: 'var(--accent)' }}>
              {formatTime(elapsed)}
            </div>
          )}
        </div>
        <div className="w-16" />
      </div>

      <div className="flex flex-1 max-w-4xl mx-auto w-full px-6 py-8 gap-8">
        {/* Left: Persona + controls */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-6">
          {/* Persona card */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="relative w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                style={{ background: persona.avatarColor }}
              >
                {persona.avatarInitials}
                {whoIsSpeaking === 'assistant' && (
                  <span className="pulse-ring absolute inset-0 rounded-full" />
                )}
              </div>
              <div>
                <div className="font-semibold" style={{ color: 'var(--text)' }}>{persona.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{persona.title}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{persona.company}</div>
              </div>
            </div>

            {whoIsSpeaking === 'assistant' && (
              <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-muted)' }}>
                <SpeakingIndicator />
                <span className="text-xs">Speaking...</span>
              </div>
            )}
            {whoIsSpeaking === 'user' && (
              <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--success)' }}>
                <SpeakingIndicator />
                <span className="text-xs">You&apos;re speaking...</span>
              </div>
            )}

            <div className="space-y-2 mb-5">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>Their Pain</div>
              {persona.painPoints.map((p, i) => (
                <div key={i} className="text-xs flex gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--accent)' }}>·</span>
                  {p}
                </div>
              ))}
            </div>

            <div className="text-xs rounded-lg p-2.5" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-dim)' }}>ATS: </span>{persona.ats}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {callState === 'idle' && (
              <button
                onClick={startCall}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'var(--accent)', color: 'white' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
              >
                Start Call
              </button>
            )}

            {callState === 'connecting' && (
              <div className="w-full py-3.5 rounded-xl text-center text-sm" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
                Connecting...
              </div>
            )}

            {callState === 'active' && (
              <>
                <button
                  onClick={toggleMute}
                  className="w-full py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: isMuted ? 'var(--warning)' : 'var(--surface)',
                    color: isMuted ? 'black' : 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {isMuted ? 'Unmute Mic' : 'Mute Mic'}
                </button>
                <button
                  onClick={endCall}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: 'var(--danger)', color: 'white' }}
                >
                  End Call & Get Feedback
                </button>
              </>
            )}

            {callState === 'ending' && (
              <div className="w-full py-3.5 rounded-xl text-center text-sm" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
                Grading your call...
              </div>
            )}

            {error && (
              <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--danger-glow)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                {error}
              </div>
            )}
          </div>

          {/* Tips */}
          {callState === 'idle' && (
            <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-dim)' }}>
                {callType === 'discovery' ? 'Discovery Tips' : 'Demo Tips'}
              </div>
              {callType === 'discovery' ? (
                <ul className="space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <li>· Open with context from the previous touch</li>
                  <li>· Set an agenda, ask permission to explore</li>
                  <li>· Ask process questions, not product questions</li>
                  <li>· Dig deeper—don&apos;t accept the first answer</li>
                  <li>· Close with a specific next step</li>
                </ul>
              ) : (
                <ul className="space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <li>· Recap discovery pain before demoing</li>
                  <li>· Show only what&apos;s relevant to their pain</li>
                  <li>· Use &ldquo;you&rdquo; language throughout</li>
                  <li>· Handle objections with empathy + evidence</li>
                  <li>· Close with a concrete next step</li>
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Right: Transcript */}
        <div className="flex-1 flex flex-col">
          <div
            className="flex-1 rounded-2xl p-5 overflow-y-auto"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', minHeight: '400px', maxHeight: '60vh' }}
          >
            {callState === 'idle' && (
              <div className="h-full flex flex-col items-center justify-center text-center" style={{ color: 'var(--text-dim)' }}>
                <div className="text-4xl mb-4">🎙</div>
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Ready when you are</div>
                <div className="text-xs">Hit &ldquo;Start Call&rdquo; to begin. Your transcript will appear here.</div>
              </div>
            )}

            {callState === 'connecting' && (
              <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-dim)' }}>
                <div className="text-sm">Connecting to {persona.name}...</div>
              </div>
            )}

            {(callState === 'active' || callState === 'ending') && transcript.length === 0 && (
              <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-dim)' }}>
                <div className="text-sm">Waiting for conversation to start...</div>
              </div>
            )}

            <div className="space-y-4">
              {transcript.map((entry, i) => (
                <div
                  key={i}
                  className={`flex gap-3 animate-fade-in ${entry.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5"
                    style={{
                      background: entry.role === 'user' ? 'var(--accent)' : persona.avatarColor,
                      color: 'white',
                    }}
                  >
                    {entry.role === 'user' ? 'T' : persona.avatarInitials[0]}
                  </div>
                  <div
                    className="rounded-xl px-4 py-2.5 text-sm leading-relaxed max-w-[80%]"
                    style={{
                      background: entry.role === 'user' ? 'var(--accent-glow)' : 'var(--surface)',
                      border: `1px solid ${entry.role === 'user' ? 'var(--accent)' : 'var(--border)'}`,
                      color: 'var(--text)',
                    }}
                  >
                    {entry.content}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>

          {callState === 'active' && (
            <div className="mt-3 text-xs text-center" style={{ color: 'var(--text-dim)' }}>
              Live transcript · {transcript.length} exchanges
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
