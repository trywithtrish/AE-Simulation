'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DISCOVERY_COACH_PERSONA } from '@/lib/discovery-coach'

interface TranscriptEntry {
  role: 'user' | 'assistant'
  content: string
}

type CallState = 'idle' | 'connecting' | 'active' | 'ending'

const DISCOVERY_TIPS = [
  'Open questions only — no yes/no questions',
  'Layer follow-ups: ask "what does that look like?" three times',
  'Quantify pain — get to specific numbers',
  'Connect pain to impact: "what does that cost you?"',
  'Map the buying group: "who else is involved?"',
  'Listen — let Riley talk 60%+ of the time',
  'Don\'t pitch. Ever. This is discovery only.',
]

function SpeakingBars() {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="speaking-bar w-0.5 rounded-full" style={{ background: 'var(--accent)', height: '100%' }} />
      ))}
    </div>
  )
}

export default function DiscoveryCoachPage() {
  const router = useRouter()

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
    setCallState('connecting')
    setError(null)
    try {
      const res = await fetch('/api/discovery-coach/session', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to create session')
      const data = await res.json()
      const ephemeralKey: string = data.client_secret?.value
      if (!ephemeralKey) throw new Error('No ephemeral key')
      // Store the variant so the grade route knows what Riley's situation was
      if (data.rileyVariant) {
        sessionStorage.setItem('discoveryCoach.variant', JSON.stringify(data.rileyVariant))
      }

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
      stream.getTracks().forEach((t) => pc.addTrack(t, stream))

      const dc = pc.createDataChannel('oai-events')
      dcRef.current = dc
      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data)
          handleRealtimeEvent(event)
        } catch { /* ignore */ }
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
      if (!sdpRes.ok) throw new Error('Realtime SDP exchange failed')
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
    sessionStorage.setItem('discoveryCoach.transcript', JSON.stringify(transcriptRef.current))
    router.push('/discovery-coach/debrief')
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <button onClick={() => callState === 'idle' && router.push('/')} disabled={callState !== 'idle'} className="text-sm hover:opacity-70 disabled:opacity-30" style={{ color: 'var(--text-muted)' }}>
          ← Back
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Discovery Deep Dive · {DISCOVERY_COACH_PERSONA.name}</div>
          {callState === 'active' && <div className="text-xs" style={{ color: 'var(--accent)' }}>{formatTime(elapsed)}</div>}
        </div>
        <div className="w-12" />
      </div>

      <div className="flex flex-1 max-w-4xl mx-auto w-full px-6 py-6 gap-6">
        <div className="w-72 flex-shrink-0 flex flex-col gap-4">
          {/* Persona card */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{ background: DISCOVERY_COACH_PERSONA.avatarColor }}>
                {DISCOVERY_COACH_PERSONA.avatarInitials}
                {whoIsSpeaking === 'assistant' && <span className="pulse-ring absolute inset-0 rounded-full" />}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{DISCOVERY_COACH_PERSONA.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{DISCOVERY_COACH_PERSONA.title}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{DISCOVERY_COACH_PERSONA.company}</div>
              </div>
            </div>
            {whoIsSpeaking === 'assistant' && (
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-muted)' }}>
                <SpeakingBars /><span className="text-xs">Speaking...</span>
              </div>
            )}
            {whoIsSpeaking === 'user' && (
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--success)' }}>
                <SpeakingBars /><span className="text-xs">You&apos;re speaking...</span>
              </div>
            )}
            <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-muted)' }}>
              You&apos;ve booked a 20-minute discovery call with Riley. They&apos;re busy and won&apos;t volunteer pain — you have to dig.
            </p>
          </div>

          {/* Discovery focus */}
          <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--accent)' }}>
              Your only job: discovery
            </div>
            <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              {DISCOVERY_TIPS.map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: 'var(--accent)' }}>·</span>{tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Controls */}
          <div className="space-y-2">
            {callState === 'idle' && (
              <button onClick={startCall} className="w-full py-3.5 rounded-xl font-semibold text-sm text-white" style={{ background: 'var(--accent)' }}>
                Start discovery call
              </button>
            )}
            {callState === 'connecting' && (
              <div className="w-full py-3.5 rounded-xl text-center text-sm" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
                Connecting...
              </div>
            )}
            {callState === 'active' && (
              <>
                <button onClick={toggleMute} className="w-full py-3 rounded-xl text-sm font-medium" style={{ background: isMuted ? 'var(--warning)' : 'var(--surface)', color: isMuted ? 'black' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {isMuted ? 'Unmute' : 'Mute mic'}
                </button>
                <button onClick={endCall} className="w-full py-3.5 rounded-xl font-semibold text-sm text-white" style={{ background: 'var(--danger)' }}>
                  End call & get coaching
                </button>
              </>
            )}
            {callState === 'ending' && (
              <div className="w-full py-3.5 rounded-xl text-center text-sm" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
                Wrapping up...
              </div>
            )}
            {error && (
              <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--danger-glow)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 rounded-2xl p-5 overflow-y-auto" style={{ background: 'var(--card)', border: '1px solid var(--border)', minHeight: '400px', maxHeight: '70vh' }}>
            {callState === 'idle' && (
              <div className="h-full flex flex-col items-center justify-center text-center" style={{ color: 'var(--text-dim)' }}>
                <div className="text-4xl mb-4">🎯</div>
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>20-minute discovery call with Riley</div>
                <div className="text-xs max-w-sm">Riley is the Director of Talent at Attio. Their pain is real but layered — vague answers stay vague. You have to ask the right questions to unlock each layer.</div>
              </div>
            )}
            {callState === 'connecting' && (
              <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-dim)' }}>
                <div className="text-sm">Connecting to Riley...</div>
              </div>
            )}
            {(callState === 'active' || callState === 'ending') && transcript.length === 0 && (
              <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-dim)' }}>
                <div className="text-sm">Riley&apos;s waiting — start with your opener.</div>
              </div>
            )}
            <div className="space-y-4">
              {transcript.map((entry, i) => {
                const isAe = entry.role === 'user'
                return (
                  <div key={i} className={`flex gap-3 animate-fade-in ${isAe ? 'flex-row-reverse' : ''}`}>
                    <div className="flex flex-col" style={{ maxWidth: '78%', alignItems: isAe ? 'flex-end' : 'flex-start' }}>
                      <div className="text-[10px] font-semibold mb-0.5 whitespace-nowrap" style={{ color: isAe ? 'var(--accent)' : DISCOVERY_COACH_PERSONA.avatarColor }}>
                        {isAe ? 'Trisha (AE)' : `${DISCOVERY_COACH_PERSONA.name} (${DISCOVERY_COACH_PERSONA.title})`}
                      </div>
                      <div className="rounded-xl px-4 py-2.5 text-sm leading-relaxed" style={{
                        background: isAe ? 'var(--accent-glow)' : 'var(--surface)',
                        border: `1px solid ${isAe ? 'var(--accent)' : 'var(--border)'}`,
                        color: 'var(--text)',
                      }}>
                        {entry.content}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={transcriptEndRef} />
            </div>
          </div>
          {callState === 'active' && (
            <div className="mt-3 text-xs text-center" style={{ color: 'var(--text-dim)' }}>
              Discovery only · Don&apos;t pitch · {transcript.length} exchanges
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
