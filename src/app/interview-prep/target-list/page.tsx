'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ListGraderResult } from '@/lib/interview-prep'

interface Row {
  name: string
  rationale: string
}

const EMPTY_ROWS: Row[] = Array.from({ length: 5 }, () => ({ name: '', rationale: '' }))

function fitColor(score: number) {
  if (score >= 8) return '#22c55e'
  if (score >= 6) return '#84cc16'
  if (score >= 4) return '#f59e0b'
  return '#ef4444'
}

export default function TargetListPage() {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>(EMPTY_ROWS)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ListGraderResult | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function update(i: number, field: keyof Row, value: string) {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }

  function addRow() {
    if (rows.length >= 10) return
    setRows((prev) => [...prev, { name: '', rationale: '' }])
  }

  function removeRow(i: number) {
    if (rows.length <= 5) return
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function submit() {
    setError(null)
    const filled = rows.filter((r) => r.name.trim())
    if (filled.length < 5) {
      setError('Add at least 5 companies before submitting.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/interview-prep/grade-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companies: filled }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Grading failed')
      }
      const data = await res.json() as ListGraderResult
      setResult(data)
      setPicked(data.topPick)
      sessionStorage.setItem('interviewPrep.targetList', JSON.stringify(filled))
      sessionStorage.setItem('interviewPrep.listGrade', JSON.stringify(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  function continueToBrief() {
    if (!picked) return
    const chosen = rows.find((r) => r.name.trim() === picked)
    if (!chosen) return
    sessionStorage.setItem('interviewPrep.chosenCompany', JSON.stringify(chosen))
    router.push('/interview-prep/brief')
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push('/interview-prep')}
            className="text-sm flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Back
          </button>
          <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Part 1 · Target list</div>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {!result && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text)' }}>
                Pick 5 sub-500-FTE prospects.
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Real companies you&apos;d actually call. For each, write 1–2 sentences on why they&apos;re a fit for Metaview — call out hiring volume, ATS, stage, or specific pain signals. We grade against the actual ICP. Be specific; vague rationale gets dinged.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-5"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>
                      Company {i + 1}
                    </div>
                    {rows.length > 5 && (
                      <button
                        onClick={() => removeRow(i)}
                        className="text-xs"
                        style={{ color: 'var(--text-dim)' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    value={row.name}
                    onChange={(e) => update(i, 'name', e.target.value)}
                    placeholder="Company name (e.g. Ramp, Linear, Gusto)"
                    className="w-full px-3 py-2 rounded-lg text-sm mb-2"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                  <textarea
                    value={row.rationale}
                    onChange={(e) => update(i, 'rationale', e.target.value)}
                    placeholder="Why is this a Metaview fit? (Stage, headcount, ATS, hiring volume, pain signals)"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <button
                onClick={addRow}
                disabled={rows.length >= 10}
                className="text-xs px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-40"
                style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                + Add row ({rows.length}/10)
              </button>
              <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                Min 5, max 10
              </div>
            </div>

            {error && (
              <div className="rounded-lg p-3 text-xs mb-4" style={{ background: 'var(--danger-glow)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={submitting}
              className="w-full py-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              {submitting ? 'Grading your list...' : 'Submit list for grading'}
            </button>
          </>
        )}

        {result && (
          <div className="space-y-6 animate-slide-up">
            <div
              className="rounded-2xl p-6 flex items-center gap-6"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="text-center flex-shrink-0">
                <div
                  className="text-5xl font-bold leading-none mb-1"
                  style={{ color: fitColor(result.overallScore / 10) }}
                >
                  {result.overallScore}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-dim)' }}>/ 100</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>
                  Target list quality
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {result.overallCritique}
                </p>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
                Per-company breakdown
              </div>
              <div className="space-y-3">
                {result.perCompany.map((c) => {
                  const isPicked = picked === c.companyName
                  return (
                    <button
                      key={c.companyName}
                      onClick={() => setPicked(c.companyName)}
                      className="w-full text-left rounded-2xl p-5 transition-all"
                      style={{
                        background: isPicked ? 'var(--accent-glow)' : 'var(--card)',
                        border: `1px solid ${isPicked ? 'var(--accent)' : 'var(--border)'}`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-2 gap-3">
                        <div className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--text)' }}>
                          {c.companyName}
                          {isPicked && (
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{ background: 'var(--accent)', color: 'white' }}
                            >
                              Selected for roleplay
                            </span>
                          )}
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                          <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                            Fit <span className="font-semibold" style={{ color: fitColor(c.fitScore) }}>{c.fitScore}/10</span>
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                            Rationale <span className="font-semibold" style={{ color: fitColor(c.rationaleScore) }}>{c.rationaleScore}/10</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {c.critique}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                Pick one to roleplay
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
                We&apos;ll generate a target-account brief (stakeholders, ATS, hiring context) for the company you select, then drop you into the call. Recommended: <span className="font-semibold" style={{ color: 'var(--text)' }}>{result.topPick}</span>.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setResult(null); setPicked(null) }}
                className="flex-1 py-3.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                Edit list
              </button>
              <button
                onClick={continueToBrief}
                disabled={!picked}
                className="flex-[2] py-3.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40"
                style={{ background: 'var(--accent)' }}
              >
                Continue with {picked ?? '(pick one)'} →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
