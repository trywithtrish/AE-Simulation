import OpenAI from 'openai'
import { personas } from '@/lib/personas'
import type { CallType } from '@/lib/personas'
import { METAVIEW_KNOWLEDGE, DISCOVERY_RUBRIC, DEMO_RUBRIC } from '@/lib/metaview'

export interface TranscriptEntry {
  role: 'user' | 'assistant'
  content: string
}

export interface GradeCategory {
  name: string
  score: number
  maxScore: number
  feedback: string
  examples: string[]
}

export interface CoachingMoment {
  quote: string
  issue: string
  betterApproach: string
}

export interface ActionableRecommendation {
  area: string
  action: string
  exampleLanguage: string
}

export interface GradeResult {
  overallGrade: string
  overallScore: number
  callType: string
  personaName: string
  categories: GradeCategory[]
  strengths: string[]
  improvements: string[]
  recommendations: ActionableRecommendation[]
  coachingMoments: CoachingMoment[]
  summary: string
}

export async function POST(req: Request) {
  const openai = new OpenAI()
  const { transcript, personaId, callType } = await req.json() as {
    transcript: TranscriptEntry[]
    personaId: string
    callType: CallType
  }

  const persona = personas.find((p) => p.id === personaId)
  if (!persona) {
    return Response.json({ error: 'Persona not found' }, { status: 404 })
  }

  const rubric = callType === 'discovery' ? DISCOVERY_RUBRIC : DEMO_RUBRIC

  const transcriptText = transcript
    .map((t) => `${t.role === 'user' ? 'AE (Trisha)' : persona.name}: ${t.content}`)
    .join('\n\n')

  const systemPrompt = `You are an elite sales coach who specializes in evaluating SaaS AE calls. You have deep expertise in the MetaView interview intelligence platform and know its product, pricing, integrations, and competitive landscape inside and out. You are rigorous, specific, and constructive—you cite exact moments from the transcript.

${METAVIEW_KNOWLEDGE}

${rubric}

The AE being evaluated is playing the role of a MetaView Account Executive. The prospect is ${persona.name}, ${persona.title} at ${persona.company}.

Persona context:
- Company stage: ${persona.stage}, ${persona.employees} employees
- ATS: ${persona.ats}
- Pain points: ${persona.painPoints.join('; ')}
- Hiring goals: ${persona.hiringGoals}

Evaluate the AE's performance against the rubric. Be honest and specific. If the call was short or the AE didn't engage meaningfully, reflect that in low scores. Quote exact lines from the transcript when citing examples.

For the "recommendations" field: each recommendation must be genuinely actionable. Do not write vague advice like "ask more discovery questions." Instead, name the specific moment or pattern from this call, explain the concrete behavior change, and write the exact words or phrase the AE could use in a future call. The exampleLanguage should be a complete sentence or two they could actually say out loud — not a template, a real line.

Return ONLY valid JSON matching this exact structure:
{
  "overallGrade": "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F",
  "overallScore": <number 0-100>,
  "callType": "${callType}",
  "personaName": "${persona.name}",
  "categories": [
    {
      "name": "<category name from rubric>",
      "score": <number>,
      "maxScore": <max points for this category>,
      "feedback": "<2-3 sentence specific feedback>",
      "examples": ["<exact quote or moment>", "<another example if applicable>"]
    }
  ],
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<specific area to improve 1>", "<area 2>", "<area 3>"],
  "recommendations": [
    {
      "area": "<which skill or category this addresses>",
      "action": "<one concrete thing to try differently next time — specific behavior, not a platitude>",
      "exampleLanguage": "<exact words or phrasing the AE could use — write it in first person as if they are speaking it on a real call>"
    }
  ],
  "coachingMoments": [
    {
      "quote": "<exact quote from transcript where AE missed an opportunity or made a mistake>",
      "issue": "<what went wrong>",
      "betterApproach": "<specific language they could have used instead>"
    }
  ],
  "summary": "<2-3 sentence overall assessment>"
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Please grade this ${callType} call transcript:\n\n${transcriptText}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const result = JSON.parse(completion.choices[0].message.content ?? '{}')
  return Response.json(result)
}
