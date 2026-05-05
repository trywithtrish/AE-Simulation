'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { OBJECTION_SCENARIOS, pickRandom, type ObjectionScenario } from '@/lib/quiz'
import type { ObjectionGradeResult } from '@/app/api/objection-quiz/grade/route'

const GRADE_COLOR: Record<string, string> = {
  'A+': '#22c55e', A: '#22c55e', 'A-': '#4ade80',
  'B+': '#86efac', B: '#f59e0b', 'B-': '#fbbf24',
  'C+': '#f97316', C: '#fb923c', 'D': '#ef4444', F: '#dc2626',
}

function DimBar({ score, max, label }: { score: number; max: number; label: string }) {
  const pct = (score / max) * 100
  const color = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-3">
      <div className="text-xs w-28 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="flex-1 rounded-full h-1.5" style={{ background: 'var(--border)' }}>
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono w-10 text-right" style={{ color: 'var(--text-muted)' }}>{score}/{max}</span>
    </div>
  )
}

export default function ObjectionQuizPage() {
  const router = useRouter()

  const pickNew = useCallback((exclude?: ObjectionScenario) => {
    const obj = pickRandom(OBJECTION_SCENARIOS, exclude)
    const scenario = pickRandom(obj.scenarios)
    return { objection: obj, scenario }
  }, [])

  const [{ objection, scenario }, setState] = useState(() => pickNew())
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ObjectionGradeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<{ score: number }[]>([])
  const [streak, setStreak] = useState(0)

  async function submit() {
    if (!answer.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/objection-quiz/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objection, scenario, answer }),
      })
      if (!res.ok) throw new Error('Grading failed')
      const data = await res.json() as ObjectionGradeResult
      setResult(data)
      setHistory((h) => [...h, { score: data.score }])
      if (data.score >= 8) setStreak((s) => s + 1)
      else setStreak(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  function next() {
    const n = pickNew(objection)
    setState(n)
    setAnswer('')
    setResult(null)
    setError(null)
  }

  const avgScore = history.length > 0
    ? Math.round((history.reduce((s, h) => s + h.score, 0) / history.length) * 10) / 10
    : null

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>
            ← Back
          </button>
          <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Objection Handling Test</div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-dim)' }}>
            {streak >= 2 && <span style={{ color: '#f59e0b' }}>🔥 {streak} streak</span>}
            {avgScore !== null && <span>{history.length} answered · avg {avgScore}/10</span>}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Scenario card */}
        <div className="rounded-2xl p-6 mb-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-dim)' }}>
            Scenario
          </div>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text)' }}>
            {scenario}
          </p>
        </div>
        <div className="text-xs mb-6 px-1" style={{ color: 'var(--text-dim)' }}>
          Core objection: <span style={{ color: 'var(--text-muted)' }}>{objection.objection}</span>
        </div>

        {/* Answer */}
        {!result && (
          <>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Respond as you would on a real call. Acknowledge the concern first, then address it specifically."
              rows={6}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none mb-4"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              disabled={submitting}
            />
            {error && (
              <div className="rounded-lg p-3 text-xs mb-4" style={{ background: 'var(--danger-glow)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={next}
                className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                Skip
              </button>
              <button
                onClick={submit}
                disabled={!answer.trim() || submitting}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-40"
                style={{ background: 'var(--accent)' }}
              >
                {submitting ? 'Grading...' : 'Submit response'}
              </button>
            </div>
          </>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4 animate-slide-up">
            {/* Score */}
            <div className="rounded-2xl p-6 flex items-center gap-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="text-center flex-shrink-0">
                <div className="text-5xl font-bold leading-none mb-1" style={{ color: GRADE_COLOR[result.letterGrade] ?? 'var(--accent)' }}>
                  {result.letterGrade}
                </div>
                <div className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>{result.score}/10</div>
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>{result.verdict}</p>
                <div className="space-y-2">
                  <DimBar score={result.breakdown.acknowledge.score} max={result.breakdown.acknowledge.max} label="Acknowledge" />
                  <DimBar score={result.breakdown.specificity.score} max={result.breakdown.specificity.max} label="Specificity" />
                  <DimBar score={result.breakdown.proofPoint.score} max={result.breakdown.proofPoint.max} label="Proof point" />
                </div>
              </div>
            </div>

            {/* Per-dimension feedback + tip */}
            <div className="space-y-3">
              {(
                [
                  { key: 'acknowledge', label: 'Acknowledge' },
                  { key: 'specificity', label: 'Specificity' },
                  { key: 'proofPoint', label: 'Proof point' },
                ] as const
              ).map(({ key, label }) => {
                const dim = result.breakdown[key]
                const pct = (dim.score / dim.max) * 100
                const accent = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={key} className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{label}</span>
                      <span className="text-xs font-mono" style={{ color: accent }}>{dim.score}/{dim.max}</span>
                    </div>
                    <p className="text-xs leading-relaxed mb-2.5" style={{ color: 'var(--text-muted)' }}>{dim.feedback}</p>
                    {dim.tip && (
                      <div className="rounded-lg px-3 py-2" style={{ background: 'var(--surface)', borderLeft: `3px solid ${accent}` }}>
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: accent }}>Try: </span>
                        <span className="text-xs italic leading-relaxed" style={{ color: 'var(--text)' }}>&ldquo;{dim.tip}&rdquo;</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* What worked */}
            {result.whatWorked.length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-xs font-semibold mb-3" style={{ color: '#22c55e' }}>What worked</div>
                <ul className="space-y-2">
                  {result.whatWorked.map((s, i) => (
                    <li key={i} className="text-xs flex gap-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      <span style={{ color: '#22c55e' }}>✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Model response */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-dim)' }}>
                Model response
              </div>
              <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-muted)' }}>
                &ldquo;{result.modelResponse}&rdquo;
              </p>
            </div>

            <button
              onClick={next}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'var(--accent)' }}
            >
              Next objection →
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
