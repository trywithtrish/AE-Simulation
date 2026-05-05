'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { TargetAccount, InterviewPrepTranscriptEntry, StakeholderRole, Stakeholder } from '@/lib/interview-prep'

type CallState = 'idle' | 'connecting' | 'active' | 'ending'

interface SessionRefs {
  pc: RTCPeerConnection | null
  dc: RTCDataChannel | null
  audio: HTMLAudioElement | null
  responding: boolean
}

function newSessionRefs(): SessionRefs {
  return { pc: null, dc: null, audio: null, responding: false }
}

function SpeakingBars() {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="speaking-bar w-0.5 rounded-full"
          style={{ background: 'var(--accent)', height: '100%' }}
        />
      ))}
    </div>
  )
}

function StakeholderTile({
  stakeholder,
  speaking,
}: { stakeholder: Stakeholder; speaking: boolean }) {
  return (
    <div
      className="rounded-2xl p-4 transition-all"
      style={{
        background: speaking ? 'var(--accent-glow)' : 'var(--card)',
        border: `1px solid ${speaking ? 'var(--accent)' : 'var(--border)'}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0"
          style={{ background: stakeholder.avatarColor }}
        >
          {stakeholder.avatarInitials}
          {speaking && <span className="pulse-ring absolute inset-0 rounded-full" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-xs" style={{ color: 'var(--text)' }}>{stakeholder.name}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{stakeholder.title}</div>
        </div>
        {speaking && <SpeakingBars />}
      </div>
    </div>
  )
}

export default function InterviewPrepCallPage() {
  const router = useRouter()

  const [account, setAccount] = useState<TargetAccount | null>(null)
  const [callState, setCallState] = useState<CallState>('idle')
  const [transcript, setTranscript] = useState<InterviewPrepTranscriptEntry[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [activeSpeaker, setActiveSpeaker] = useState<'ae' | StakeholderRole | null>(null)
  const [error, setError] = useState<string | null>(null)

  const transcriptRef = useRef<InterviewPrepTranscriptEntry[]>([])
  const localStreamRef = useRef<MediaStream | null>(null)
  const vpRef = useRef<SessionRefs>(newSessionRefs())
  const dirRef = useRef<SessionRefs>(newSessionRefs())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const lastUserUtteranceRef = useRef<string>('')
  const accountRef = useRef<TargetAccount | null>(null)
  const orchestratingRef = useRef<boolean>(false)
  const pendingFollowupRef = useRef<StakeholderRole | null>(null)

  useEffect(() => {
    const cached = sessionStorage.getItem('interviewPrep.targetAccount')
    if (!cached) {
      router.push('/interview-prep/target-list')
      return
    }
    const parsed = JSON.parse(cached) as TargetAccount
    setAccount(parsed)
    accountRef.current = parsed
  }, [router])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const addTranscriptEntry = useCallback((speaker: 'ae' | StakeholderRole, content: string) => {
    if (!content.trim()) return
    const entry: InterviewPrepTranscriptEntry = { speaker, content }
    transcriptRef.current = [...transcriptRef.current, entry]
    setTranscript([...transcriptRef.current])
  }, [])

  const refsFor = useCallback((role: StakeholderRole): SessionRefs => {
    return role === 'vpPeople' ? vpRef.current : dirRef.current
  }, [])

  const otherRole = (role: StakeholderRole): StakeholderRole =>
    role === 'vpPeople' ? 'directorTa' : 'vpPeople'

  const sendOnDc = useCallback((role: StakeholderRole, payload: Record<string, unknown>) => {
    const refs = refsFor(role)
    if (refs.dc?.readyState === 'open') {
      refs.dc.send(JSON.stringify(payload))
    }
  }, [refsFor])

  const triggerResponse = useCallback((role: StakeholderRole) => {
    const refs = refsFor(role)
    if (refs.responding) return
    refs.responding = true
    setActiveSpeaker(role)
    sendOnDc(role, { type: 'response.create' })
  }, [refsFor, sendOnDc])

  const cancelResponse = useCallback((role: StakeholderRole) => {
    const refs = refsFor(role)
    if (!refs.responding) return
    sendOnDc(role, { type: 'response.cancel' })
    refs.responding = false
  }, [refsFor, sendOnDc])

  const injectAssistantContext = useCallback((role: StakeholderRole, otherSpokenText: string) => {
    const a = accountRef.current
    if (!a) return
    const otherStakeholder = a.stakeholders[otherRole(role)]
    sendOnDc(role, {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text: `[Side-channel: ${otherStakeholder.name} (${otherStakeholder.title}) just said aloud on the call: "${otherSpokenText}"]`,
        }],
      },
    })
  }, [sendOnDc])

  const decideAndTriggerNextSpeaker = useCallback(async () => {
    if (orchestratingRef.current) return
    const a = accountRef.current
    if (!a) return
    orchestratingRef.current = true
    try {
      const res = await fetch('/api/interview-prep/next-speaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: a, recentTranscript: transcriptRef.current }),
      })
      if (!res.ok) throw new Error('next-speaker failed')
      const data = await res.json() as { speaker: StakeholderRole | 'both' }

      if (data.speaker === 'both') {
        pendingFollowupRef.current = 'directorTa'
        triggerResponse('vpPeople')
      } else {
        pendingFollowupRef.current = null
        triggerResponse(data.speaker)
      }
    } catch {
      triggerResponse('vpPeople')
    } finally {
      orchestratingRef.current = false
    }
  }, [triggerResponse])

  const handleSessionEvent = useCallback((role: StakeholderRole, event: Record<string, unknown>) => {
    const type = event.type as string

    switch (type) {
      case 'response.audio_transcript.done': {
        const text = event.transcript as string | undefined
        if (text) {
          addTranscriptEntry(role, text)
          injectAssistantContext(otherRole(role), text)
        }
        const refs = refsFor(role)
        refs.responding = false
        setActiveSpeaker(null)

        if (pendingFollowupRef.current && pendingFollowupRef.current !== role) {
          const next = pendingFollowupRef.current
          pendingFollowupRef.current = null
          setTimeout(() => triggerResponse(next), 350)
        }
        break
      }
      case 'response.audio.delta':
        setActiveSpeaker(role)
        break
      case 'response.audio.done':
        // handled by transcript.done
        break
      case 'response.cancelled':
      case 'response.canceled':
      case 'response.done': {
        const refs = refsFor(role)
        if (refs.responding) {
          refs.responding = false
          if (activeSpeaker === role) setActiveSpeaker(null)
        }
        break
      }
      case 'conversation.item.input_audio_transcription.completed': {
        if (role !== 'vpPeople') break
        const text = event.transcript as string | undefined
        if (!text) break
        if (lastUserUtteranceRef.current === text) break
        lastUserUtteranceRef.current = text
        addTranscriptEntry('ae', text)
        decideAndTriggerNextSpeaker()
        break
      }
      case 'input_audio_buffer.speech_started': {
        if (role !== 'vpPeople') break
        setActiveSpeaker('ae')
        if (vpRef.current.responding) cancelResponse('vpPeople')
        if (dirRef.current.responding) cancelResponse('directorTa')
        pendingFollowupRef.current = null
        break
      }
      case 'input_audio_buffer.speech_stopped': {
        if (role !== 'vpPeople') break
        setActiveSpeaker(null)
        break
      }
    }
  }, [addTranscriptEntry, injectAssistantContext, refsFor, triggerResponse, cancelResponse, activeSpeaker, decideAndTriggerNextSpeaker])

  async function setupSession(role: StakeholderRole, micStream: MediaStream): Promise<SessionRefs> {
    const a = accountRef.current
    if (!a) throw new Error('no account')

    const sessionRes = await fetch('/api/interview-prep/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: a, speakingAs: role }),
    })
    if (!sessionRes.ok) throw new Error(`session create failed for ${role}`)
    const sessionData = await sessionRes.json()
    const ephemeralKey: string = sessionData.client_secret?.value
    if (!ephemeralKey) throw new Error(`no ephemeral key for ${role}`)

    const pc = new RTCPeerConnection()

    const audio = document.createElement('audio')
    audio.autoplay = true
    audio.style.display = 'none'
    document.body.appendChild(audio)
    pc.ontrack = (e) => { audio.srcObject = e.streams[0] }

    micStream.getTracks().forEach((track) => pc.addTrack(track, micStream))

    const dc = pc.createDataChannel('oai-events')
    dc.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        handleSessionEvent(role, event)
      } catch {
        // ignore
      }
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
    if (!sdpRes.ok) throw new Error(`SDP exchange failed for ${role}`)

    await pc.setRemoteDescription({ type: 'answer', sdp: await sdpRes.text() })

    const refs: SessionRefs = { pc, dc, audio, responding: false }
    if (role === 'vpPeople') vpRef.current = refs
    else dirRef.current = refs
    return refs
  }

  async function startCall() {
    if (!accountRef.current) return
    setCallState('connecting')
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream

      await Promise.all([
        setupSession('vpPeople', stream),
        setupSession('directorTa', stream),
      ])

      // Wait for data channels to open
      await new Promise<void>((resolve) => {
        const check = () => {
          if (vpRef.current.dc?.readyState === 'open' && dirRef.current.dc?.readyState === 'open') {
            resolve()
          } else {
            setTimeout(check, 100)
          }
        }
        check()
      })

      setCallState('active')
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)

      // Brief opening from the VP to break the silence
      setTimeout(() => {
        const a = accountRef.current
        if (!a) return
        sendOnDc('vpPeople', {
          type: 'response.create',
          response: {
            instructions: `Briefly greet the AE. Introduce yourself ("${a.stakeholders.vpPeople.name}, ${a.stakeholders.vpPeople.title} at ${a.companyName}") and acknowledge that ${a.stakeholders.directorTa.name} is also on the call. Mention you have ~30 minutes. Then hand it back to the AE: "What did you want to walk through today?" Keep this under 15 seconds total.`,
          },
        })
        vpRef.current.responding = true
        setActiveSpeaker('vpPeople')
      }, 600)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start call')
      setCallState('idle')
    }
  }

  function tearDown() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    for (const refs of [vpRef.current, dirRef.current]) {
      refs.dc?.close()
      refs.pc?.close()
      if (refs.audio) {
        refs.audio.srcObject = null
        refs.audio.remove()
      }
    }
    vpRef.current = newSessionRefs()
    dirRef.current = newSessionRefs()
  }

  async function endCall() {
    setCallState('ending')
    tearDown()
    sessionStorage.setItem('interviewPrep.transcript', JSON.stringify(transcriptRef.current))
    router.push('/interview-prep/reflection')
  }

  function toggleMute() {
    localStreamRef.current?.getTracks().forEach((t) => { t.enabled = !t.enabled })
    setIsMuted((m) => !m)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      vpRef.current.pc?.close()
      dirRef.current.pc?.close()
    }
  }, [])

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <p>Loading account...</p>
      </div>
    )
  }

  const vp = account.stakeholders.vpPeople
  const dir = account.stakeholders.directorTa

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => callState === 'idle' ? router.push('/interview-prep/brief') : null}
          className="text-sm flex items-center gap-1.5 transition-opacity hover:opacity-70 disabled:opacity-30"
          style={{ color: 'var(--text-muted)' }}
          disabled={callState !== 'idle'}
        >
          ← Back
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Live roleplay · {account.companyName}
          </div>
          {callState === 'active' && (
            <div className="text-xs" style={{ color: 'var(--accent)' }}>{formatTime(elapsed)}</div>
          )}
        </div>
        <div className="w-12" />
      </div>

      <div className="flex flex-1 max-w-5xl mx-auto w-full px-6 py-6 gap-6">
        <div className="w-72 flex-shrink-0 flex flex-col gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              On the call
            </div>
            <div className="space-y-2">
              <StakeholderTile stakeholder={vp} speaking={activeSpeaker === 'vpPeople'} />
              <StakeholderTile stakeholder={dir} speaking={activeSpeaker === 'directorTa'} />
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Quick reference
            </div>
            <div className="space-y-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <div><span style={{ color: 'var(--text-dim)' }}>ATS:</span> {account.ats}</div>
              <div><span style={{ color: 'var(--text-dim)' }}>Stage:</span> {account.stage}</div>
              <div><span style={{ color: 'var(--text-dim)' }}>Headcount:</span> ~{account.employees}</div>
              <div><span style={{ color: 'var(--text-dim)' }}>Recruiters:</span> {account.recruitingTeamSize}</div>
            </div>
          </div>

          <div className="space-y-2">
            {callState === 'idle' && (
              <button
                onClick={startCall}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all"
                style={{ background: 'var(--accent)' }}
              >
                Start the call
              </button>
            )}
            {callState === 'connecting' && (
              <div className="w-full py-3.5 rounded-xl text-center text-sm" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
                Connecting both stakeholders...
              </div>
            )}
            {callState === 'active' && (
              <>
                <button
                  onClick={toggleMute}
                  className="w-full py-3 rounded-xl text-sm font-medium"
                  style={{
                    background: isMuted ? 'var(--warning)' : 'var(--surface)',
                    color: isMuted ? 'black' : 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {isMuted ? 'Unmute mic' : 'Mute mic'}
                </button>
                <button
                  onClick={endCall}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white"
                  style={{ background: 'var(--danger)' }}
                >
                  End call
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

          {callState === 'idle' && (
            <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                Tactics
              </div>
              <ul className="space-y-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <li>· Address each stakeholder by name</li>
                <li>· Tactical questions to {dir.name.split(' ')[0]}, strategic to {vp.name.split(' ')[0]}</li>
                <li>· ~10-12 min discovery, then pivot to pitch</li>
                <li>· Tie pitch back to specific things they said</li>
                <li>· Close with concrete, time-bound next step</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <div
            className="flex-1 rounded-2xl p-5 overflow-y-auto"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', minHeight: '400px', maxHeight: '70vh' }}
          >
            {callState === 'idle' && (
              <div className="h-full flex flex-col items-center justify-center text-center" style={{ color: 'var(--text-dim)' }}>
                <div className="text-4xl mb-4">🎙</div>
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Two stakeholders, one call</div>
                <div className="text-xs max-w-xs">{vp.name} and {dir.name} will join with distinct voices. Hit &ldquo;Start the call&rdquo; when ready.</div>
              </div>
            )}

            {callState === 'connecting' && (
              <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-dim)' }}>
                <div className="text-sm">Spinning up both stakeholders...</div>
              </div>
            )}

            {(callState === 'active' || callState === 'ending') && transcript.length === 0 && (
              <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-dim)' }}>
                <div className="text-sm">{vp.name.split(' ')[0]} should kick things off shortly...</div>
              </div>
            )}

            <div className="space-y-4">
              {transcript.map((entry, i) => {
                const isAe = entry.speaker === 'ae'
                const sk = entry.speaker === 'vpPeople' ? vp : entry.speaker === 'directorTa' ? dir : null
                const initials = isAe ? 'T' : sk!.avatarInitials
                const color = isAe ? 'var(--accent)' : sk!.avatarColor
                const label = isAe ? 'You' : sk!.name
                return (
                  <div
                    key={i}
                    className={`flex gap-3 animate-fade-in ${isAe ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5 text-white"
                      style={{ background: color }}
                    >
                      {initials}
                    </div>
                    <div className={`max-w-[80%] ${isAe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className="text-[10px] mb-0.5 px-1" style={{ color: 'var(--text-dim)' }}>{label}</div>
                      <div
                        className="rounded-xl px-4 py-2.5 text-sm leading-relaxed"
                        style={{
                          background: isAe ? 'var(--accent-glow)' : 'var(--surface)',
                          border: `1px solid ${isAe ? 'var(--accent)' : 'var(--border)'}`,
                          color: 'var(--text)',
                        }}
                      >
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
              Live · {transcript.length} exchanges · two stakeholders, distinct voices
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
