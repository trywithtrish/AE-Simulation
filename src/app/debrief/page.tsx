'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GradeResult } from '@/app/api/grade/route'

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

export default function DebriefPage() {
  const router = useRouter()
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState<GradeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<{ role: string; content: string }[]>([])
  const [showTranscript, setShowTranscript] = useState(false)

  useEffect(() => {
    const storedTranscript = sessionStorage.getItem('callTranscript')
    const personaId = sessionStorage.getItem('callPersonaId')
    const callType = sessionStorage.getItem('callType')

    if (!storedTranscript || !personaId || !callType) {
      router.push('/')
      return
    }

    const parsed = JSON.parse(storedTranscript)
    setTranscript(parsed)

    if (parsed.length === 0) {
      setError('No transcript found. The call may have been too short.')
      return
    }

    setGrading(true)
    fetch('/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: parsed, personaId, callType }),
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

  const gradeColor = result ? (GRADE_COLOR[result.overallGrade] ?? '#6366f1') : 'var(--accent)'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Call Debrief</div>
          <button
            onClick={() => router.push('/')}
            className="text-sm px-4 py-2 rounded-lg transition-all"
            style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            Practice Again
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {grading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-6">🎯</div>
            <div className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Grading your call...</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Analyzing your transcript against the MetaView sales rubric
            </div>
          </div>
        )}

        {error && !grading && (
          <div className="rounded-xl p-6 text-center" style={{ background: 'var(--card)', border: '1px solid var(--danger)' }}>
            <div className="text-lg mb-2" style={{ color: 'var(--danger)' }}>Couldn&apos;t grade this call</div>
            <div className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{error}</div>
            <button onClick={() => router.push('/')} style={{ color: 'var(--accent)' }} className="text-sm">
              Go back and try again
            </button>
          </div>
        )}

        {result && !grading && (
          <div className="space-y-6 animate-slide-up">
            {/* Overall grade */}
            <div
              className="rounded-2xl p-8 flex items-center gap-8"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="text-center flex-shrink-0">
                <div
                  className="text-7xl font-bold leading-none mb-1"
                  style={{ color: gradeColor }}
                >
                  {result.overallGrade}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                  {result.overallScore}/100
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>
                  {result.callType === 'discovery' ? 'Discovery Call' : 'Demo Call'} · {result.personaName}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {result.summary}
                </p>
              </div>
            </div>

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
                      <span style={{ color: '#22c55e' }}>✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-sm font-semibold mb-4" style={{ color: '#f59e0b' }}>Areas to improve</div>
                <ul className="space-y-2.5">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="text-xs flex gap-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      <span style={{ color: '#f59e0b' }}>→</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Coaching moments */}
            {result.coachingMoments.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>
                  Coaching Moments
                </div>
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

            {/* Transcript toggle */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
                style={{ background: 'var(--card)', color: 'var(--text-muted)' }}
              >
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Full Transcript ({transcript.length} exchanges)
                </span>
                <span className="text-xs">{showTranscript ? '↑ Collapse' : '↓ Expand'}</span>
              </button>

              {showTranscript && (
                <div className="px-6 py-4 space-y-3 max-h-96 overflow-y-auto" style={{ background: 'var(--surface)' }}>
                  {transcript.map((entry, i) => (
                    <div key={i} className={`flex gap-3 ${entry.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div
                        className="text-xs font-semibold flex-shrink-0 mt-0.5 w-6 text-center"
                        style={{ color: entry.role === 'user' ? 'var(--accent)' : 'var(--text-dim)' }}
                      >
                        {entry.role === 'user' ? 'T' : 'P'}
                      </div>
                      <div
                        className="text-xs rounded-lg px-3 py-2 leading-relaxed max-w-[85%]"
                        style={{
                          background: entry.role === 'user' ? 'var(--accent-glow)' : 'var(--card)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {entry.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => router.push('/')}
                className="flex-1 py-3.5 rounded-xl font-semibold text-sm text-white"
                style={{ background: 'var(--accent)' }}
              >
                Try Another Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
