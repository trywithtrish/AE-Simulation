'use client'

import { useRouter } from 'next/navigation'

const PARTS = [
  {
    n: 1,
    title: 'Target list',
    duration: '5–10 min',
    blurb: 'Identify 5 sub-500-FTE companies you believe are strong Metaview prospects. You\'ll share rationale, then we grade against the actual SMB ICP. Pick one to carry forward.',
  },
  {
    n: 2,
    title: 'Live roleplay',
    duration: '~30 min',
    blurb: 'You\'ve booked a first meeting with the VP of People AND Director of Talent Acquisition. Both stakeholders are voiced by AI on the call. Run discovery, then present a tailored Metaview pitch.',
  },
  {
    n: 3,
    title: 'Reflection',
    duration: '~10 min',
    blurb: 'Self-assess before seeing the AI grade. Then debrief side-by-side: where you over- or under-rated yourself, what to drill next.',
  },
]

export default function InterviewPrepLanding() {
  const router = useRouter()

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-sm flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Back
          </button>
          <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Interview Prep</div>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
            Sales Acumen Interview · SMB
          </div>
          <h1 className="text-3xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Practice the full interview, end-to-end.
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            This mode mirrors the actual Metaview AE interview format: target-list building, a 30-minute live roleplay with two stakeholders (VP of People + Director of Talent Acquisition), and a reflection step. Run it as many times as you want — every run is fresh.
          </p>
        </div>

        <div className="space-y-3 mb-10">
          {PARTS.map((p) => (
            <div
              key={p.n}
              className="rounded-2xl p-5 flex gap-5"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--border)' }}
              >
                {p.n}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{p.title}</span>
                  <span className="text-xs" style={{ color: 'var(--text-dim)' }}>· {p.duration}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.blurb}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-5 mb-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
            What makes this realistic
          </div>
          <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <li>· The two stakeholders run as <span style={{ color: 'var(--text)' }}>two parallel realtime AI sessions</span> with distinct voices.</li>
            <li>· They have different priorities — VP People thinks ROI/strategy, Director of TA thinks workflow/tactics.</li>
            <li>· They&apos;ll prompt you for the pitch around minute 12. They&apos;ll push back if you skip discovery.</li>
            <li>· Grading rewards stakeholder-aware behavior: did you tailor questions and pitch to each role?</li>
          </ul>
        </div>

        <button
          onClick={() => router.push('/interview-prep/target-list')}
          className="w-full py-4 rounded-xl font-semibold text-sm transition-all"
          style={{ background: 'var(--accent)', color: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
        >
          Start with the target list →
        </button>
      </div>
    </main>
  )
}
