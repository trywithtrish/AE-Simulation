'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SelfReflection } from '@/lib/interview-prep'

const QUESTIONS = [
  {
    key: 'whatWentWell' as const,
    label: 'What went well on that call?',
    placeholder: 'Be specific — what moments felt strong? Did you uncover real pain? Land a good question?',
  },
  {
    key: 'whatToChangeNext' as const,
    label: 'What would you do differently next time?',
    placeholder: 'One or two concrete things you\'d change. Specific beats vague.',
  },
]

export default function ReflectionPage() {
  const router = useRouter()
  const [form, setForm] = useState<Partial<SelfReflection>>({
    selfGradeOutOf10: 6,
    addressedBothStakeholders: 'mostly',
  })
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof SelfReflection>(key: K, value: SelfReflection[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function submit() {
    if (!form.whatWentWell?.trim() || !form.whatToChangeNext?.trim()) return
    setSubmitting(true)
    sessionStorage.setItem('interviewPrep.reflection', JSON.stringify(form))
    router.push('/interview-prep/debrief')
  }

  const isValid = form.whatWentWell?.trim() && form.whatToChangeNext?.trim()

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Part 3 · Reflection</div>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Before the grade, reflect.
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Answer these in about 2 minutes. Then we&apos;ll show you the AI grade alongside your self-assessment so you can see the gaps.
          </p>
        </div>

        <div className="space-y-6">
          {QUESTIONS.map((q) => (
            <div key={q.key} className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
                {q.label}
              </label>
              <textarea
                value={(form[q.key] as string) ?? ''}
                onChange={(e) => update(q.key, e.target.value as SelfReflection[typeof q.key])}
                placeholder={q.placeholder}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-sm resize-none"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
          ))}

          <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <label className="block text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Self-grade (1–10)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={10}
                value={form.selfGradeOutOf10 ?? 5}
                onChange={(e) => update('selfGradeOutOf10', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: 'var(--accent)' }}
              />
              <div
                className="text-2xl font-bold w-8 text-center"
                style={{ color: 'var(--accent)' }}
              >
                {form.selfGradeOutOf10 ?? 5}
              </div>
            </div>
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
              <span>1 — rough</span>
              <span>10 — nailed it</span>
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
              Did you engage both stakeholders meaningfully?
            </label>
            <div className="space-y-2">
              {(['yes', 'mostly', 'no'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => update('addressedBothStakeholders', v)}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all"
                  style={{
                    background: form.addressedBothStakeholders === v ? 'var(--accent-glow)' : 'var(--surface)',
                    border: `1px solid ${form.addressedBothStakeholders === v ? 'var(--accent)' : 'var(--border)'}`,
                    color: 'var(--text)',
                  }}
                >
                  {{
                    yes: 'Yes — I addressed both by name and tailored to each role',
                    mostly: 'Mostly — one got more attention than the other',
                    no: 'No — I treated them as one audience or forgot about one of them',
                  }[v]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!isValid || submitting}
          className="w-full mt-8 py-4 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40"
          style={{ background: 'var(--accent)' }}
        >
          {submitting ? 'Loading your debrief...' : 'See AI grade & debrief →'}
        </button>
      </div>
    </main>
  )
}
