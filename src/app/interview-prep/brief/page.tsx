'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TargetAccount, Stakeholder } from '@/lib/interview-prep'

function StakeholderCard({ s }: { s: Stakeholder }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
          style={{ background: s.avatarColor }}
        >
          {s.avatarInitials}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{s.name}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.title}</div>
        </div>
      </div>

      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
        {s.background}
      </p>

      <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-dim)' }}>
        Top concerns
      </div>
      <ul className="space-y-1 mb-3">
        {s.concerns.map((c, i) => (
          <li key={i} className="text-xs flex gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent)' }}>·</span>{c}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-1">
        {s.personalityTags.map((t) => (
          <span
            key={t}
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'var(--border-subtle)', color: 'var(--text-muted)' }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function BriefPage() {
  const router = useRouter()
  const [account, setAccount] = useState<TargetAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cached = sessionStorage.getItem('interviewPrep.targetAccount')
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as TargetAccount
        setAccount(parsed)
        setLoading(false)
        return
      } catch {
        // fall through to regen
      }
    }

    const chosenRaw = sessionStorage.getItem('interviewPrep.chosenCompany')
    if (!chosenRaw) {
      router.push('/interview-prep/target-list')
      return
    }
    const chosen = JSON.parse(chosenRaw) as { name: string; rationale: string }

    fetch('/api/interview-prep/generate-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: chosen.name, rationale: chosen.rationale }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to generate account')
        return res.json() as Promise<TargetAccount>
      })
      .then((data) => {
        sessionStorage.setItem('interviewPrep.targetAccount', JSON.stringify(data))
        setAccount(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Generation failed')
        setLoading(false)
      })
  }, [router])

  function regenerate() {
    sessionStorage.removeItem('interviewPrep.targetAccount')
    setAccount(null)
    setLoading(true)
    setError(null)
    const chosenRaw = sessionStorage.getItem('interviewPrep.chosenCompany')
    if (!chosenRaw) {
      router.push('/interview-prep/target-list')
      return
    }
    const chosen = JSON.parse(chosenRaw) as { name: string; rationale: string }

    fetch('/api/interview-prep/generate-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: chosen.name, rationale: chosen.rationale }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to regenerate')
        return res.json() as Promise<TargetAccount>
      })
      .then((data) => {
        sessionStorage.setItem('interviewPrep.targetAccount', JSON.stringify(data))
        setAccount(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Generation failed')
        setLoading(false)
      })
  }

  function startCall() {
    if (!account) return
    router.push('/interview-prep/call')
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push('/interview-prep/target-list')}
            className="text-sm flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Back
          </button>
          <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Pre-call brief</div>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-4xl mb-4">📋</div>
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Building your account brief...</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Generating stakeholders, ATS, hiring context</div>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl p-6 text-center" style={{ background: 'var(--card)', border: '1px solid var(--danger)' }}>
            <div className="text-sm mb-3" style={{ color: 'var(--danger)' }}>{error}</div>
            <button onClick={regenerate} className="text-sm" style={{ color: 'var(--accent)' }}>Try again</button>
          </div>
        )}

        {account && !loading && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
                You&apos;ve booked the meeting
              </div>
              <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
                {account.companyName}
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {account.oneLiner}
              </p>
            </div>

            <div className="rounded-2xl p-5 grid grid-cols-2 gap-4 text-xs" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div>
                <div className="font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>Stage</div>
                <div style={{ color: 'var(--text)' }}>{account.stage}</div>
              </div>
              <div>
                <div className="font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>Headcount</div>
                <div style={{ color: 'var(--text)' }}>~{account.employees} employees</div>
              </div>
              <div>
                <div className="font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>ATS</div>
                <div style={{ color: 'var(--text)' }}>{account.ats}</div>
              </div>
              <div>
                <div className="font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>Recruiting team</div>
                <div style={{ color: 'var(--text)' }}>{account.recruitingTeamSize} recruiters</div>
              </div>
              <div className="col-span-2">
                <div className="font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>Hiring volume</div>
                <div style={{ color: 'var(--text)' }}>{account.hiringVolume}</div>
              </div>
              {account.recentFunding && (
                <div className="col-span-2">
                  <div className="font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>Recent funding</div>
                  <div style={{ color: 'var(--text)' }}>{account.recentFunding}</div>
                </div>
              )}
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                Why they took the meeting
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {account.sharedContext}
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
                Who&apos;s on the call
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <StakeholderCard s={account.stakeholders.vpPeople} />
                <StakeholderCard s={account.stakeholders.directorTa} />
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                What you&apos;re running
              </div>
              <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <li>· Run discovery — uncover real pain across both roles, qualify timeline + decision process</li>
                <li>· Around minute 12, pivot into a tailored Metaview pitch anchored to what you heard</li>
                <li>· Address each stakeholder by name; tailor questions and pitch by role</li>
                <li>· Close with a concrete, time-bound next step that implicates both stakeholders</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={regenerate}
                className="flex-1 py-3.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                Regenerate brief
              </button>
              <button
                onClick={startCall}
                className="flex-[2] py-3.5 rounded-xl font-semibold text-sm text-white transition-all"
                style={{ background: 'var(--accent)' }}
              >
                Start the call →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
