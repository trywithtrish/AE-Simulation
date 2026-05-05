'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { GradeResult } from '@/app/api/grade/route'
import type { SelfReflection, TargetAccount, InterviewPrepTranscriptEntry } from '@/lib/interview-prep'

const GRADE_COLOR: Record<string, string> = {
  A: '#22c55e', 'A-': '#4ade80',
  'B+': '#86efac', B: '#f59e0b', 'B-': '#fbbf24',
  'C+': '#f97316', C: '#fb923c', 'C-': '#ef4444',
  D: '#dc2626', F: '#991b1b',
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-full h-1.5" style={{ background: 'var(--border)' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono w-12 text-right" style={{ color: 'var(--text-muted)' }}>
        {score}/{max}
      </span>
    </div>
  )
}

function selfGradeToLetter(n: number): string {
  if (n >= 9) return 'A'
  if (n >= 8) return 'B+'
  if (n >= 7) return 'B'
  if (n >= 6) return 'C+'
  if (n >= 5) return 'C'
  return 'D'
}

export default function InterviewPrepDebriefPage() {
  const router = useRouter()
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState<GradeResult | null>(null)
  const [reflection, setReflection] = useState<SelfReflection | null>(null)
  const [transcript, setTranscript] = useState<InterviewPrepTranscriptEntry[]>([])
  const [showTranscript, setShowTranscript] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const rawTranscript = sessionStorage.getItem('interviewPrep.transcript')
    const rawAccount = sessionStorage.getItem('interviewPrep.targetAccount')
    const rawReflection = sessionStorage.getItem('interviewPrep.reflection')

    if (!rawTranscript || !rawAccount) {
      router.push('/interview-prep')
      return
    }

    const parsedTranscript = JSON.parse(rawTranscript) as InterviewPrepTranscriptEntry[]
    const parsedAccount = JSON.parse(rawAccount) as TargetAccount
    setTranscript(parsedTranscript)

    if (rawReflection) {
      setReflection(JSON.parse(rawReflection) as SelfReflection)
    }

    if (parsedTranscript.length === 0) {
      setError('No transcript found — the call may have been too short.')
      return
    }

    setGrading(true)
    fetch('/api/interview-prep/grade-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: parsedTranscript, account: parsedAccount }),
    })
      .then((r) => r.json())
      .then((data) => {
        setResult(data)
        setGrading(false)
      })
      .catch((err) => {
        setError(err.message)
        setGrading(false)
      })
  }, [router])

  const gradeColor = result ? (GRADE_COLOR[result.overallGrade] ?? 'var(--accent)') : 'var(--accent)'

  const [account, setAccount] = useState<TargetAccount | null>(null)
  useEffect(() => {
    const raw = sessionStorage.getItem('interviewPrep.targetAccount')
    if (raw) setAccount(JSON.parse(raw))
  }, [])

  function speakerLabel(e: InterviewPrepTranscriptEntry, acct: TargetAccount | null): string {
    if (e.speaker === 'ae') return 'Trisha (AE)'
    if (!acct) return e.speaker
    if (e.speaker === 'vpPeople') return `${acct.stakeholders.vpPeople.name} (${acct.stakeholders.vpPeople.title})`
    return `${acct.stakeholders.directorTa.name} (${acct.stakeholders.directorTa.title})`
  }

  const copyTranscript = useCallback(() => {
    if (!transcript.length) return
    const text = transcript
      .map((e) => `${speakerLabel(e, account)}:\n${e.content}`)
      .join('\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, account])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Interview Prep · Debrief</div>
          <button
            onClick={() => router.push('/interview-prep')}
            className="text-sm px-4 py-2 rounded-lg transition-all"
            style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            Run again
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {grading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-6">🎯</div>
            <div className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Grading your call...</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Evaluating discovery, stakeholder awareness, pitch tailoring, and close
            </div>
          </div>
        )}

        {error && !grading && (
          <div className="rounded-xl p-6 text-center" style={{ background: 'var(--card)', border: '1px solid var(--danger)' }}>
            <div className="text-lg mb-2" style={{ color: 'var(--danger)' }}>Couldn&apos;t grade this call</div>
            <div className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{error}</div>
            <button onClick={() => router.push('/interview-prep')} style={{ color: 'var(--accent)' }} className="text-sm">
              Start over
            </button>
          </div>
        )}

        {result && !grading && (
          <div className="space-y-6 animate-slide-up">

            {/* Side-by-side grade comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className="rounded-2xl p-6 flex flex-col items-center text-center"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-dim)' }}>AI grade</div>
                <div className="text-6xl font-bold leading-none mb-1" style={{ color: gradeColor }}>
                  {result.overallGrade}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-dim)' }}>{result.overallScore}/100</div>
              </div>

              {reflection && (
                <div
                  className="rounded-2xl p-6 flex flex-col items-center text-center"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-dim)' }}>Your self-grade</div>
                  <div
                    className="text-6xl font-bold leading-none mb-1"
                    style={{ color: GRADE_COLOR[selfGradeToLetter(reflection.selfGradeOutOf10)] ?? 'var(--text-muted)' }}
                  >
                    {selfGradeToLetter(reflection.selfGradeOutOf10)}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-dim)' }}>{reflection.selfGradeOutOf10}/10 self-rated</div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                Overall · {result.personaName}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {result.summary}
              </p>
            </div>

            {/* Self-reflection review */}
            {reflection && (
              <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Your reflection</div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>What you said went well</div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{reflection.whatWentWell}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>What you&apos;d change</div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{reflection.whatToChangeNext}</p>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Engaged both stakeholders:</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{
                      background: reflection.addressedBothStakeholders === 'yes' ? '#22c55e22' : reflection.addressedBothStakeholders === 'mostly' ? '#f59e0b22' : '#ef444422',
                      color: reflection.addressedBothStakeholders === 'yes' ? '#22c55e' : reflection.addressedBothStakeholders === 'mostly' ? '#f59e0b' : '#ef4444',
                    }}
                  >
                    {reflection.addressedBothStakeholders}
                  </span>
                </div>
              </div>
            )}

            {/* Category scores */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>Scorecard</div>
              <div className="space-y-5">
                {result.categories.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{cat.name}</span>
                    </div>
                    <ScoreBar score={cat.score} max={cat.maxScore} />
                    <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {cat.feedback}
                    </p>
                    {cat.examples.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {cat.examples.map((ex, i) => (
                          <div
                            key={i}
                            className="text-xs rounded-lg px-3 py-2 italic"
                            style={{ background: 'var(--surface)', color: 'var(--text-dim)', borderLeft: '2px solid var(--border)' }}
                          >
                            &ldquo;{ex}&rdquo;
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-sm font-semibold mb-4" style={{ color: '#22c55e' }}>What you did well</div>
                <ul className="space-y-2.5">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-xs flex gap-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      <span style={{ color: '#22c55e' }}>✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-sm font-semibold mb-4" style={{ color: '#f59e0b' }}>Areas to improve</div>
                <ul className="space-y-2.5">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="text-xs flex gap-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      <span style={{ color: '#f59e0b' }}>→</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Actionable Recommendations</div>
                <p className="text-xs mb-5" style={{ color: 'var(--text-dim)' }}>
                  Specific things to try next time, with exact language you can use.
                </p>
                <div className="space-y-4">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
                        {rec.area}
                      </div>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
                        {rec.action}
                      </p>
                      <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--card)', border: '1px solid var(--accent)', borderLeft: '3px solid var(--accent)' }}>
                        <div className="text-[10px] font-semibold mb-1" style={{ color: 'var(--accent)' }}>Try saying:</div>
                        <p className="text-xs italic leading-relaxed" style={{ color: 'var(--text)' }}>
                          &ldquo;{rec.exampleLanguage}&rdquo;
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coaching moments */}
            {result.coachingMoments.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>Coaching Moments</div>
                <div className="space-y-5">
                  {result.coachingMoments.map((m, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div
                        className="text-xs italic mb-2 px-3 py-2 rounded-lg"
                        style={{ background: 'var(--border-subtle)', color: 'var(--text-dim)', borderLeft: '2px solid var(--accent)' }}
                      >
                        &ldquo;{m.quote}&rdquo;
                      </div>
                      <div className="text-xs mb-1.5" style={{ color: 'var(--danger)' }}>
                        <span className="font-semibold">Issue: </span>{m.issue}
                      </div>
                      <div className="text-xs" style={{ color: '#22c55e' }}>
                        <span className="font-semibold">Try instead: </span>{m.betterApproach}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transcript */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
                style={{ background: 'var(--card)', color: 'var(--text-muted)' }}
              >
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Full transcript ({transcript.length} exchanges)
                </span>
                <span className="text-xs">{showTranscript ? '↑ Collapse' : '↓ Expand'}</span>
              </button>
              {showTranscript && (
                <>
                <div className="px-6 py-4 space-y-4 max-h-[480px] overflow-y-auto" style={{ background: 'var(--surface)' }}>
                  {transcript.map((entry, i) => {
                    const isAe = entry.speaker === 'ae'
                    const sk = entry.speaker === 'vpPeople' ? account?.stakeholders.vpPeople : account?.stakeholders.directorTa
                    const color = isAe ? 'var(--accent)' : sk?.avatarColor ?? 'var(--text-dim)'
                    const label = speakerLabel(entry, account)
                    return (
                      <div key={i} className={`flex gap-3 ${isAe ? 'flex-row-reverse' : ''}`}>
                        <div className="flex flex-col" style={{ maxWidth: '78%', alignItems: isAe ? 'flex-end' : 'flex-start' }}>
                          <div className="text-[10px] font-semibold mb-0.5 whitespace-nowrap" style={{ color }}>
                            {label}
                          </div>
                          <div
                            className="text-xs rounded-lg px-3 py-2 leading-relaxed"
                            style={{
                              background: isAe ? 'var(--accent-glow)' : 'var(--card)',
                              color: 'var(--text-muted)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            {entry.content}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="px-6 py-3 flex justify-end" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={copyTranscript}
                    className="text-xs px-4 py-2 rounded-lg font-medium transition-all"
                    style={{
                      background: copied ? '#22c55e22' : 'var(--card)',
                      color: copied ? '#22c55e' : 'var(--text-muted)',
                      border: `1px solid ${copied ? '#22c55e' : 'var(--border)'}`,
                    }}
                  >
                    {copied ? '✓ Copied!' : 'Copy transcript'}
                  </button>
                </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => router.push('/interview-prep')}
                className="flex-1 py-3.5 rounded-xl font-semibold text-sm text-white"
                style={{ background: 'var(--accent)' }}
              >
                Run another rep
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
