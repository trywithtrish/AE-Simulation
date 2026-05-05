'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PRODUCT_QUESTIONS, pickRandom, type ProductQuestion } from '@/lib/quiz'
import type { QuizGradeResult } from '@/app/api/product-quiz/grade/route'

const GRADE_COLOR: Record<string, string> = {
  'A+': '#22c55e', A: '#22c55e', 'A-': '#4ade80',
  'B+': '#86efac', B: '#f59e0b', 'B-': '#fbbf24',
  'C+': '#f97316', C: '#fb923c', 'D': '#ef4444', F: '#dc2626',
}

const DIFFICULTY_COLOR = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }

function ScoreBar({ score, max, color }: { score: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-full h-1.5" style={{ background: 'var(--border)' }}>
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${(score / max) * 100}%`, background: color }} />
      </div>
      <span className="text-xs font-mono w-10 text-right" style={{ color: 'var(--text-muted)' }}>{score}/{max}</span>
    </div>
  )
}

export default function ProductQuizPage() {
  const router = useRouter()

  const pickNewQuestion = useCallback((exclude?: ProductQuestion) => {
    const q = pickRandom(PRODUCT_QUESTIONS, exclude)
    const prompt = pickRandom(q.prompts)
    return { question: q, prompt }
  }, [])

  const [{ question, prompt }, setState] = useState(() => pickNewQuestion())
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizGradeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [history, setHistory] = useState<{ score: number; topic: string }[]>([])

  async function submit() {
    if (!answer.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/product-quiz/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, prompt, answer }),
      })
      if (!res.ok) throw new Error('Grading failed')
      const data = await res.json() as QuizGradeResult
      setResult(data)
      setHistory((h) => [...h, { score: data.score, topic: question.topic }])
      if (data.score >= 8) setStreak((s) => s + 1)
      else setStreak(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  function next() {
    const next = pickNewQuestion(question)
    setState(next)
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
          <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Product Knowledge Test</div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-dim)' }}>
            {streak >= 2 && <span style={{ color: '#f59e0b' }}>🔥 {streak} streak</span>}
            {avgScore !== null && <span>{history.length} answered · avg {avgScore}/10</span>}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Question card */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ background: 'var(--surface)', color: 'var(--text-dim)' }}
            >
              {question.topic}
            </span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded"
              style={{
                color: DIFFICULTY_COLOR[question.difficulty],
                background: `${DIFFICULTY_COLOR[question.difficulty]}18`,
              }}
            >
              {question.difficulty}
            </span>
          </div>
          <p className="text-base leading-relaxed font-medium" style={{ color: 'var(--text)' }}>
            {prompt}
          </p>
        </div>

        {/* Answer area */}
        {!result && (
          <>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here. Be specific — vague answers score low."
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
                {submitting ? 'Grading...' : 'Submit answer'}
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
              <div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.verdict}</p>
                <ScoreBar score={result.score} max={10} color={GRADE_COLOR[result.letterGrade] ?? 'var(--accent)'} />
              </div>
            </div>

            {/* What you got right / missed */}
            <div className="grid grid-cols-2 gap-3">
              {result.whatYouGotRight.length > 0 && (
                <div className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="text-xs font-semibold mb-3" style={{ color: '#22c55e' }}>Got right</div>
                  <ul className="space-y-2">
                    {result.whatYouGotRight.map((s, i) => (
                      <li key={i} className="text-xs flex gap-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: '#22c55e' }}>✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.whatYouMissed.length > 0 && (
                <div className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="text-xs font-semibold mb-3" style={{ color: '#f59e0b' }}>Missed or wrong</div>
                  <ul className="space-y-2">
                    {result.whatYouMissed.map((s, i) => (
                      <li key={i} className="text-xs flex gap-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: '#f59e0b' }}>→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Model answer */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-dim)' }}>
                Model answer
              </div>
              <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-muted)' }}>
                &ldquo;{result.correctAnswer}&rdquo;
              </p>
            </div>

            <button
              onClick={next}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'var(--accent)' }}
            >
              Next question →
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
