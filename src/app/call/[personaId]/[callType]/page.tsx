'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { personas } from '@/lib/personas'
import type { CallType } from '@/lib/personas'
import type { TranscriptEntry } from '@/app/api/grade/route'

type CallState = 'idle' | 'connecting' | 'active' | 'ending'

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
  const [isMuted, setIsMuted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [whoIsSpeaking, setWhoIsSpeaking] = useState<'user' | 'assistant' | null>(null)
  const [error, setError] = useState<string | null>(null)

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const addTranscriptEntry = useCallback((role: 'user' | 'assistant', content: string) => {
    if (!content.trim()) return
    transcriptRef.current = [...transcriptRef.current, { role, content }]
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
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId, callType }),
      })
      if (!res.ok) throw new Error('Failed to create session')
      const data = await res.json()
      const ephemeralKey: string = data.client_secret?.value
      if (!ephemeralKey) throw new Error('No ephemeral key returned')

      const pc = new RTCPeerConnection()
      pcRef.current = pc

      const audio = document.createElement('audio')
      audio.autoplay = true
      audio.style.display = 'none'
      document.body.appendChild(audio)
      audioRef.current = audio
      pc.ontrack = (e) => { audio.srcObject = e.streams[0] }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      const dc = pc.createDataChannel('oai-events')
      dcRef.current = dc
      dc.onmessage = (e) => {
        try { handleRealtimeEvent(JSON.parse(e.data)) } catch { /* ignore */ }
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const sdpRes = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview', {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
      })
      if (!sdpRes.ok) throw new Error('Failed to connect to Realtime API')

      await pc.setRemoteDescription({ type: 'answer', sdp: await sdpRes.text() })

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
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    dcRef.current?.close()
    pcRef.current?.close()
    if (audioRef.current) {
      audioRef.current.srcObject = null
      audioRef.current.remove()
    }
    sessionStorage.setItem('callTranscript', JSON.stringify(transcriptRef.current))
    sessionStorage.setItem('callPersonaId', personaId)
    sessionStorage.setItem('callType', callType)
    router.push('/debrief')
  }

  function toggleMute() {
    localStreamRef.current?.getTracks().forEach((t) => { t.enabled = !t.enabled })
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
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--bg)' }}>
      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 text-sm transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-muted)' }}
      >
        ← Back
      </button>

      {/* Call type label */}
      <div className="absolute top-6 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
        {callTypeLabel}
      </div>

      {/* Central call UI */}
      <div className="flex flex-col items-center gap-8">

        {/* Avatar */}
        <div className="relative flex flex-col items-center gap-4">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-white text-3xl font-semibold"
            style={{
              background: persona.avatarColor,
              boxShadow: whoIsSpeaking === 'assistant'
                ? `0 0 0 4px ${persona.avatarColor}40, 0 0 32px ${persona.avatarColor}60`
                : 'none',
              transition: 'box-shadow 0.2s ease',
            }}
          >
            {persona.avatarInitials}
          </div>

          <div className="text-center">
            <div className="font-semibold text-lg" style={{ color: 'var(--text)' }}>{persona.name}</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{persona.title} · {persona.company}</div>
          </div>
        </div>

        {/* Status */}
        <div className="h-8 flex items-center justify-center">
          {callState === 'idle' && (
            <span className="text-sm" style={{ color: 'var(--text-dim)' }}>Ready to connect</span>
          )}
          {callState === 'connecting' && (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Connecting...</span>
          )}
          {callState === 'active' && whoIsSpeaking === 'assistant' && (
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-end gap-0.5 h-4">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="speaking-bar w-0.5 rounded-full" style={{ background: persona.avatarColor, height: '100%' }} />
                ))}
              </div>
              <span className="text-sm">Speaking</span>
            </div>
          )}
          {callState === 'active' && whoIsSpeaking === 'user' && (
            <div className="flex items-center gap-2" style={{ color: 'var(--success)' }}>
              <div className="flex items-end gap-0.5 h-4">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="speaking-bar w-0.5 rounded-full" style={{ background: 'var(--success)', height: '100%' }} />
                ))}
              </div>
              <span className="text-sm">Listening</span>
            </div>
          )}
          {callState === 'active' && !whoIsSpeaking && (
            <span className="text-sm font-mono" style={{ color: 'var(--accent)' }}>{formatTime(elapsed)}</span>
          )}
          {callState === 'ending' && (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Grading your call...</span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {callState === 'idle' && (
            <button
              onClick={startCall}
              className="px-10 py-3.5 rounded-full font-semibold text-sm text-white transition-all"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
            >
              Start Call
            </button>
          )}

          {callState === 'connecting' && (
            <div className="px-10 py-3.5 rounded-full text-sm" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
              Connecting...
            </div>
          )}

          {callState === 'active' && (
            <>
              <button
                onClick={toggleMute}
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all"
                style={{
                  background: isMuted ? 'var(--warning)' : 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? '🔇' : '🎙'}
              </button>
              <button
                onClick={endCall}
                className="px-8 py-3.5 rounded-full font-semibold text-sm text-white transition-all"
                style={{ background: 'var(--danger)' }}
              >
                End Call
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="rounded-lg px-4 py-3 text-xs max-w-sm text-center" style={{ background: 'var(--danger-glow)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
            {error}
          </div>
        )}

        {/* Pre-call tips */}
        {callState === 'idle' && (
          <div className="mt-4 max-w-xs text-center">
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-dim)' }}>
              {callType === 'discovery' ? 'Discovery' : 'Demo'} · Quick tips
            </div>
            <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-dim)' }}>
              {callType === 'discovery' ? (
                <>
                  <div>Open with context from your previous touch</div>
                  <div>Ask process questions, not product questions</div>
                  <div>Dig deeper — don&apos;t accept first answers</div>
                  <div>Close with a specific next step</div>
                </>
              ) : (
                <>
                  <div>Recap their pain before you demo anything</div>
                  <div>Show only what&apos;s relevant to their situation</div>
                  <div>Handle objections with empathy + evidence</div>
                  <div>Close with a concrete next step</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
