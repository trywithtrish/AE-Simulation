'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { DiscoveryGradeResult } from '@/lib/discovery-coach'
import { DISCOVERY_COACH_PERSONA } from '@/lib/discovery-coach'

const GRADE_COLOR: Record<string, string> = {
  'A+': '#22c55e', A: '#22c55e', 'A-': '#4ade80',
  'B+': '#86efac', B: '#f59e0b', 'B-': '#fbbf24',
  'C+': '#f97316', C: '#fb923c', 'C-': '#ef4444',
  D: '#dc2626', F: '#991b1b',
}

const LAYER_LABEL: Record<string, string> = {
  surface: 'Surface',
  impact: 'Impact',
  urgency: 'Urgency',
  buyingGroup: 'Buying group',
  personal: 'Personal stake',
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-full h-1.5" style={{ background: 'var(--border)' }}>
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono w-12 text-right" style={{ color: 'var(--text-muted)' }}>{score}/{max}</span>
    </div>
  )
}

interface TranscriptEntry { role: 'user' | 'assistant'; content: string }

export default function DiscoveryDebriefPage() {
  const router = useRouter()
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState<DiscoveryGradeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [showTranscript, setShowTranscript] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('discoveryCoach.transcript')
    if (!stored) {
      router.push('/')
      return
    }
    const parsed = JSON.parse(stored) as TranscriptEntry[]
    setTranscript(parsed)
    if (parsed.length === 0) {
      setError('No transcript found — the call may have been too short.')
      return
    }
    setGrading(true)
    fetch('/api/discovery-coach/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: parsed }),
    })
      .then((r) => r.json())
      .then((data) => { setResult(data); setGrading(false) })
      .catch((err) => { setError(err.message); setGrading(false) })
  }, [router])

  const copyTranscript = useCallback(() => {
    if (!transcript.length) return
    const text = transcript
      .map((e) => `${e.role === 'user' ? 'Trisha (AE)' : `${DISCOVERY_COACH_PERSONA.name} (${DISCOVERY_COACH_PERSONA.title})`}:\n${e.content}`)
      .join('\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [transcript])

  const gradeColor = result ? (GRADE_COLOR[result.overallGrade] ?? 'var(--accent)') : 'var(--accent)'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Discovery Debrief</div>
          <div className="flex gap-2">
            <button onClick={() => router.push('/discovery-coach')} className="text-sm px-4 py-2 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Run another rep
            </button>
            <button onClick={() => router.push('/')} className="text-sm px-4 py-2 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {grading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-6">🎯</div>
            <div className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Coaching your discovery...</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Identifying which pain layers you uncovered, which you missed, and what to ask next time
            </div>
          </div>
        )}

        {error && !grading && (
          <div className="rounded-xl p-6 text-center" style={{ background: 'var(--card)', border: '1px solid var(--danger)' }}>
            <div className="text-lg mb-2" style={{ color: 'var(--danger)' }}>Couldn&apos;t grade this call</div>
            <div className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{error}</div>
            <button onClick={() => router.push('/discovery-coach')} style={{ color: 'var(--accent)' }} className="text-sm">Try again</button>
          </div>
        )}

        {result && !grading && (
          <div className="space-y-6 animate-slide-up">
            {/* Overall */}
            <div className="rounded-2xl p-8 flex items-center gap-8" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="text-center flex-shrink-0">
                <div className="text-7xl font-bold leading-none mb-1" style={{ color: gradeColor }}>{result.overallGrade}</div>
                <div className="text-xs" style={{ color: 'var(--text-dim)' }}>{result.overallScore}/100</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>
                  Discovery Deep Dive · {DISCOVERY_COACH_PERSONA.name}, {DISCOVERY_COACH_PERSONA.company}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.summary}</p>
              </div>
            </div>

            {/* Talk ratio */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-dim)' }}>
                Talk ratio
              </div>
              <div className="flex h-3 rounded-full overflow-hidden mb-2" style={{ background: 'var(--surface)' }}>
                <div style={{ width: `${result.talkRatio.aePercent}%`, background: 'var(--accent)' }} />
                <div style={{ width: `${result.talkRatio.rileyPercent}%`, background: DISCOVERY_COACH_PERSONA.avatarColor }} />
              </div>
              <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                <span>You: {result.talkRatio.aePercent}%</span>
                <span>Riley: {result.talkRatio.rileyPercent}%</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.talkRatio.note}</p>
            </div>

            {/* Pain layers uncovered */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Pain layers</div>
              <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>
                Each layer is unlocked by a specific kind of question. Layers you didn&apos;t reach show what you missed.
              </p>
              <div className="space-y-3">
                {result.painLayersUncovered.map((layer) => (
                  <div key={layer.layer} className="rounded-xl p-4" style={{ background: layer.unlocked ? '#22c55e10' : 'var(--surface)', border: `1px solid ${layer.unlocked ? '#22c55e44' : 'var(--border)'}` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm" style={{ color: layer.unlocked ? '#22c55e' : 'var(--text-dim)' }}>
                        {layer.unlocked ? '✓' : '✗'}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{LAYER_LABEL[layer.layer] ?? layer.layer}</span>
                      <span className="text-xs" style={{ color: 'var(--text-dim)' }}>· {layer.description}</span>
                    </div>
                    {layer.unlocked && layer.unlockingQuote && (
                      <div className="text-xs italic px-3 py-2 rounded-lg" style={{ background: 'var(--card)', color: 'var(--text-muted)', borderLeft: '2px solid #22c55e' }}>
                        Unlocked by: &ldquo;{layer.unlockingQuote}&rdquo;
                      </div>
                    )}
                    {!layer.unlocked && (
                      <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--card)', borderLeft: '2px solid var(--accent)' }}>
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Try next time: </span>
                        <span className="italic" style={{ color: 'var(--text)' }}>&ldquo;{layer.exampleUnlockQuestion}&rdquo;</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>Discovery scorecard</div>
              <div className="space-y-5">
                {result.categories.map((cat) => (
                  <div key={cat.name}>
                    <div className="text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>{cat.name}</div>
                    <ScoreBar score={cat.score} max={cat.maxScore} />
                    <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{cat.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Missed opportunities */}
            {result.missedOpportunities?.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Moments you could have dug deeper</div>
                <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>
                  Specific points in the call where Riley opened a door and you didn&apos;t walk through it.
                </p>
                <div className="space-y-4">
                  {result.missedOpportunities.map((m, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: DISCOVERY_COACH_PERSONA.avatarColor }}>
                        Riley said
                      </div>
                      <div className="text-xs italic mb-3 px-3 py-2 rounded-lg" style={{ background: 'var(--card)', color: 'var(--text-muted)', borderLeft: `2px solid ${DISCOVERY_COACH_PERSONA.avatarColor}` }}>
                        &ldquo;{m.rileyQuote}&rdquo;
                      </div>
                      <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                        <span className="font-semibold" style={{ color: 'var(--danger)' }}>What you did: </span>
                        {m.whatYouDid}
                      </div>
                      <div className="rounded-lg px-3 py-2 mb-2" style={{ background: 'var(--card)', borderLeft: '3px solid var(--accent)' }}>
                        <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>
                          Better follow-up
                        </div>
                        <p className="text-xs italic leading-relaxed" style={{ color: 'var(--text)' }}>
                          &ldquo;{m.betterFollowUp}&rdquo;
                        </p>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                        <span className="font-semibold">Why: </span>{m.whyItMatters}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top recommendations */}
            {result.topRecommendations?.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Top recommendations</div>
                <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>
                  Three things to focus on for your next discovery rep.
                </p>
                <div className="space-y-3">
                  {result.topRecommendations.map((rec, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
                        {rec.skill}
                      </div>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>{rec.advice}</p>
                      <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--card)', border: '1px solid var(--accent)', borderLeft: '3px solid var(--accent)' }}>
                        <div className="text-[10px] font-semibold mb-1" style={{ color: 'var(--accent)' }}>Try saying</div>
                        <p className="text-xs italic leading-relaxed" style={{ color: 'var(--text)' }}>&ldquo;{rec.exampleQuestion}&rdquo;</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transcript */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button onClick={() => setShowTranscript(!showTranscript)} className="w-full px-6 py-4 flex items-center justify-between text-left" style={{ background: 'var(--card)', color: 'var(--text-muted)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Full transcript ({transcript.length} exchanges)</span>
                <span className="text-xs">{showTranscript ? '↑ Collapse' : '↓ Expand'}</span>
              </button>
              {showTranscript && (
                <>
                  <div className="px-6 py-4 space-y-4 max-h-[480px] overflow-y-auto" style={{ background: 'var(--surface)' }}>
                    {transcript.map((entry, i) => {
                      const isAe = entry.role === 'user'
                      const speakerName = isAe ? 'Trisha (AE)' : `${DISCOVERY_COACH_PERSONA.name} (${DISCOVERY_COACH_PERSONA.title})`
                      return (
                        <div key={i} className={`flex gap-3 ${isAe ? 'flex-row-reverse' : ''}`}>
                          <div className="flex flex-col" style={{ maxWidth: '78%', alignItems: isAe ? 'flex-end' : 'flex-start' }}>
                            <div className="text-[10px] font-semibold mb-0.5 whitespace-nowrap" style={{ color: isAe ? 'var(--accent)' : DISCOVERY_COACH_PERSONA.avatarColor }}>
                              {speakerName}
                            </div>
                            <div className="text-xs rounded-lg px-3 py-2 leading-relaxed" style={{
                              background: isAe ? 'var(--accent-glow)' : 'var(--card)',
                              color: 'var(--text-muted)',
                              border: '1px solid var(--border)',
                            }}>
                              {entry.content}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="px-6 py-3 flex justify-end" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                    <button onClick={copyTranscript} className="text-xs px-4 py-2 rounded-lg font-medium" style={{
                      background: copied ? '#22c55e22' : 'var(--card)',
                      color: copied ? '#22c55e' : 'var(--text-muted)',
                      border: `1px solid ${copied ? '#22c55e' : 'var(--border)'}`,
                    }}>
                      {copied ? '✓ Copied!' : 'Copy transcript'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
