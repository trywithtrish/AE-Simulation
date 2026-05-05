import OpenAI from 'openai'
import { METAVIEW_KNOWLEDGE } from '@/lib/metaview'
import { METAVIEW_ICP, type TargetAccount } from '@/lib/interview-prep'

const VOICE_OPTIONS = {
  vpPeople: ['alloy', 'echo', 'shimmer'],
  directorTa: ['sage', 'verse', 'ballad'],
} as const

const COLORS = {
  vpPeople: ['#6366f1', '#8b5cf6', '#0ea5e9'],
  directorTa: ['#10b981', '#f59e0b', '#ec4899'],
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface RequestShape {
  companyName: string
  rationale: string
}

export async function POST(req: Request) {
  const openai = new OpenAI()
  const { companyName, rationale } = await req.json() as RequestShape

  if (!companyName?.trim()) {
    return Response.json({ error: 'companyName is required' }, { status: 400 })
  }

  const systemPrompt = `You are creating a realistic target-account brief for a Metaview AE practice simulation. The AE has chosen a real (or plausibly real) company and you need to fabricate realistic stakeholder profiles for a first meeting.

Metaview product context:
${METAVIEW_KNOWLEDGE}

Metaview ICP context:
${METAVIEW_ICP}

You will produce TWO stakeholder profiles for the same company:
1. **VP of People** — strategic, owns the people function, reports to CEO/COO. Concerns lean toward: ROI, headcount strategy, board/exec metrics, time-to-hire, candidate experience, employer brand, scaling the function. Speech: more measured, frames things in terms of business outcomes.
2. **Director of Talent Acquisition** — tactical, owns day-to-day recruiting operations. Concerns lean toward: recruiter productivity, ATS workflow, scorecard adoption, interviewer training, sourcing pipeline, candidate flow. Speech: more in-the-weeds, references specific recruiters/HMs/tools.

Make the two stakeholders distinct in tone, in what they care about, and in HOW they'd react to a Metaview pitch. They should sound like two different people who know each other well and work together. They should occasionally disagree subtly or have different priorities (e.g. VP cares about board reporting; Director cares about whether HMs will actually use it).

For the company:
- If the name is a recognizable real company, use accurate details (stage, size, ATS if known, industry).
- If you don't recognize it, fabricate plausibly: pick a stage, headcount in 100–450 range (sub-500 SMB), pick a modern ATS Metaview integrates with (Greenhouse, Lever, Ashby, Gem, SmartRecruiters), pick a B2B SaaS / fintech / healthcare-SaaS / dev-tools angle.

Return ONLY valid JSON in this exact shape:
{
  "companyName": "<accurate or plausible company name>",
  "oneLiner": "<one-sentence description of what the company does>",
  "stage": "<Series A/B/C/D or similar>",
  "employees": <number 50-500>,
  "ats": "<Greenhouse | Lever | Ashby | Gem | SmartRecruiters>",
  "hiringVolume": "<e.g. '40–60 interviews/month, doubling headcount in 18 months'>",
  "recruitingTeamSize": <number 2-10>,
  "recentFunding": "<optional: e.g. '$45M Series B in late 2024'>",
  "whyTheyMatchIcp": "<2 sentences anchored to ICP signals — why this is a Metaview-shaped account>",
  "stakeholders": {
    "vpPeople": {
      "role": "vpPeople",
      "name": "<plausible first + last name>",
      "title": "<exact title — VP of People, VP People & Talent, Chief People Officer, Head of People, etc.>",
      "background": "<2-3 sentence bio — career path, what they've done at this company, what they're focused on this quarter>",
      "concerns": ["<concern 1 — strategic/ROI flavor>", "<concern 2>", "<concern 3>"],
      "personalityTags": ["<tag1>", "<tag2>", "<tag3>"],
      "speakingStyle": "<2 sentences on how this person talks — pace, what they latch onto, when they push back>"
    },
    "directorTa": {
      "role": "directorTa",
      "name": "<plausible first + last name, distinct from VP>",
      "title": "<exact title — Director of Talent Acquisition, Sr. Director of Recruiting, Head of TA, etc.>",
      "background": "<2-3 sentence bio>",
      "concerns": ["<concern 1 — tactical/workflow flavor>", "<concern 2>", "<concern 3>"],
      "personalityTags": ["<tag1>", "<tag2>", "<tag3>"],
      "speakingStyle": "<2 sentences on speaking style>"
    }
  },
  "sharedContext": "<3-4 sentences both stakeholders agree on — current state of recruiting at this company, recent context (board pressure, recent miss, headcount plan), and the specific reason they took this Metaview meeting>"
}

Return ONLY the JSON. No markdown fences, no explanation.`

  const userContent = `Company: ${companyName}
AE's rationale for picking this company: ${rationale || '(none)'}

Generate the target-account brief.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  const raw = completion.choices[0].message.content ?? '{}'
  const parsed = JSON.parse(raw)

  const initials = (name: string) => name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()

  const account: TargetAccount = {
    id: `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    companyName: parsed.companyName,
    oneLiner: parsed.oneLiner,
    stage: parsed.stage,
    employees: parsed.employees,
    ats: parsed.ats,
    hiringVolume: parsed.hiringVolume,
    recruitingTeamSize: parsed.recruitingTeamSize,
    recentFunding: parsed.recentFunding,
    whyTheyMatchIcp: parsed.whyTheyMatchIcp,
    userRationale: rationale,
    sharedContext: parsed.sharedContext,
    stakeholders: {
      vpPeople: {
        ...parsed.stakeholders.vpPeople,
        role: 'vpPeople',
        voice: pickRandom(VOICE_OPTIONS.vpPeople),
        avatarInitials: initials(parsed.stakeholders.vpPeople.name),
        avatarColor: pickRandom(COLORS.vpPeople),
      },
      directorTa: {
        ...parsed.stakeholders.directorTa,
        role: 'directorTa',
        voice: pickRandom(VOICE_OPTIONS.directorTa),
        avatarInitials: initials(parsed.stakeholders.directorTa.name),
        avatarColor: pickRandom(COLORS.directorTa),
      },
    },
  }

  return Response.json(account)
}
