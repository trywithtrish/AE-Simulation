'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { personas, type Persona, type CallType } from '@/lib/personas'

const CALL_TYPES: { id: CallType; label: string; description: string; duration: string }[] = [
  {
    id: 'discovery',
    label: 'Discovery Call',
    description: 'You had a brief intro touch. Now uncover their real pain, qualify the opportunity, and earn a demo. Focus on asking questions—not pitching.',
    duration: '20–30 min',
  },
  {
    id: 'demo',
    label: 'Demo Call',
    description: 'Discovery is done. The prospect knows their pain. Walk them through MetaView, handle objections, and close for a next step.',
    duration: '30–45 min',
  },
]

const DIFFICULTY_COLOR: Record<string, string> = {
  Warm: '#22c55e',
  Moderate: '#f59e0b',
  Challenging: '#ef4444',
}

function PersonaCard({ persona, onSelect }: { persona: Persona; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="text-left w-full rounded-2xl p-6 transition-all duration-200"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = 'var(--card-hover)'
        el.style.borderColor = 'var(--accent)'
        el.style.boxShadow = '0 0 0 1px var(--accent), 0 8px 32px var(--accent-glow)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'var(--card)'
        el.style.borderColor = 'var(--border)'
        el.style.boxShadow = 'none'
      }}
    >
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
          style={{ background: persona.avatarColor }}
        >
          {persona.avatarInitials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-base" style={{ color: 'var(--text)' }}>{persona.name}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{persona.title}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {persona.company} · {persona.stage} · {persona.employees} employees
          </div>
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            color: DIFFICULTY_COLOR[persona.difficulty],
            background: `${DIFFICULTY_COLOR[persona.difficulty]}18`,
            border: `1px solid ${DIFFICULTY_COLOR[persona.difficulty]}40`,
          }}
        >
          {persona.difficulty}
        </span>
      </div>

      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
          Pain Points
        </div>
        <ul className="space-y-1">
          {persona.painPoints.map((p, i) => (
            <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent)' }}>·</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {persona.personalityTags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded"
            style={{ background: 'var(--border-subtle)', color: 'var(--text-muted)' }}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="text-xs rounded-lg p-3" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
        <span className="font-semibold" style={{ color: 'var(--text-dim)' }}>Warm context: </span>
        {persona.warmContext}
      </div>
    </button>
  )
}

export default function Home() {
  const router = useRouter()
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)

  function handleCallType(callType: CallType) {
    if (!selectedPersona) return
    router.push(`/call/${selectedPersona.id}/${callType}`)
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'var(--accent)' }}
          >
            AE
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>AE Call Simulator</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>MetaView · Practice Edition</div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Interview Prep CTA */}
        <button
          onClick={() => router.push('/interview-prep')}
          className="w-full text-left rounded-2xl p-6 mb-8 transition-all duration-200 flex items-center gap-6"
          style={{ background: 'var(--card)', border: '1px solid var(--accent)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent), 0 8px 32px var(--accent-glow)'
            e.currentTarget.style.background = 'var(--card-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.background = 'var(--card)'
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            ★
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base mb-0.5" style={{ color: 'var(--text)' }}>
              Interview Prep Mode
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Simulate the full Metaview AE interview — target list, live roleplay with two stakeholders, reflection + grade.
            </div>
          </div>
          <div className="text-sm flex-shrink-0" style={{ color: 'var(--accent)' }}>→</div>
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Choose your prospect
          </h1>
          <p className="text-base max-w-xl" style={{ color: 'var(--text-muted)' }}>
            Each persona is a real buyer type in MetaView&apos;s ICP. They have genuine pain, real objections, and no patience for a generic pitch. Pick one, choose your call type, and go.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} onSelect={() => setSelectedPersona(persona)} />
          ))}
        </div>

        {/* Quiz modes */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              path: '/product-quiz',
              icon: '📚',
              title: 'Product Knowledge Test',
              description: 'Randomized questions on modules, integrations, pricing, proof points, and competitors. Graded with a model answer after each.',
              tag: '14 topics',
            },
            {
              path: '/objection-quiz',
              icon: '🛡️',
              title: 'Objection Handling Test',
              description: 'Realistic prospect scenarios — recording consent, adoption failure, "we use Otter," budget pushback, and more. Graded on acknowledge, specificity, proof point, and momentum.',
              tag: '12 objections',
            },
          ].map((mode) => (
            <button
              key={mode.path}
              onClick={() => router.push(mode.path)}
              className="text-left rounded-2xl p-5 transition-all duration-200"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.background = 'var(--card-hover)'
                el.style.borderColor = 'var(--accent)'
                el.style.boxShadow = '0 0 0 1px var(--accent), 0 8px 32px var(--accent-glow)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.background = 'var(--card)'
                el.style.borderColor = 'var(--border)'
                el.style.boxShadow = 'none'
              }}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl flex-shrink-0 mt-0.5">{mode.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{mode.title}</span>
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: 'var(--surface)', color: 'var(--text-dim)' }}
                    >
                      {mode.tag}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{mode.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedPersona && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6 z-50"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedPersona(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 animate-slide-up"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                style={{ background: selectedPersona.avatarColor }}
              >
                {selectedPersona.avatarInitials}
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{selectedPersona.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {selectedPersona.title} at {selectedPersona.company}
                </div>
              </div>
              <button
                onClick={() => setSelectedPersona(null)}
                className="ml-auto text-xl leading-none pb-1"
                style={{ color: 'var(--text-dim)' }}
              >
                ×
              </button>
            </div>

            <div className="text-sm font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
              What kind of call?
            </div>

            <div className="space-y-3">
              {CALL_TYPES.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => handleCallType(ct.id)}
                  className="w-full text-left rounded-xl p-4 transition-all duration-150"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = 'var(--accent)'
                    el.style.background = 'var(--accent-glow)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = 'var(--border)'
                    el.style.background = 'var(--surface)'
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{ct.label}</span>
                    <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{ct.duration}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{ct.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
