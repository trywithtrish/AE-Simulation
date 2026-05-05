import OpenAI from 'openai'
import { METAVIEW_KNOWLEDGE } from '@/lib/metaview'
import type { ObjectionScenario } from '@/lib/quiz'

interface RequestShape {
  objection: ObjectionScenario
  scenario: string
  answer: string
}

export interface ObjectionGradeResult {
  score: number
  letterGrade: string
  verdict: string
  breakdown: {
    acknowledge: { score: number; max: number; feedback: string; tip: string }
    specificity: { score: number; max: number; feedback: string; tip: string }
    proofPoint: { score: number; max: number; feedback: string; tip: string }
  }
  whatWorked: string[]
  whatToImprove: string[]
  modelResponse: string
}

function scoreToLetter(score: number): string {
  if (score >= 9.5) return 'A+'
  if (score >= 9) return 'A'
  if (score >= 8.5) return 'A-'
  if (score >= 8) return 'B+'
  if (score >= 7) return 'B'
  if (score >= 6) return 'B-'
  if (score >= 5) return 'C+'
  if (score >= 4) return 'C'
  if (score >= 3) return 'D'
  return 'F'
}

export async function POST(req: Request) {
  const openai = new OpenAI()
  const { objection, scenario, answer } = await req.json() as RequestShape

  const systemPrompt = `You are a rigorous sales coach evaluating an AE's objection handling response for Metaview, an AI recruiting platform. Focus entirely on how well they handled the objection — not on whether they moved the deal forward.

Complete Metaview product and objection knowledge:
${METAVIEW_KNOWLEDGE}

The objection being handled: "${objection.objection}"
Key points a strong response should include:
${objection.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Grade across 3 dimensions:

1. Acknowledge (0–2): Did they validate the concern before responding? Jumping straight to counter-argument without acknowledging feels dismissive.
   - 2: Genuinely acknowledged the concern with empathy before pivoting ("That's a fair concern —", "I hear that a lot, and it's worth addressing directly —", etc.)
   - 1: Nodded at it but moved past too quickly, or the acknowledgment felt perfunctory
   - 0: Ignored the concern, went straight to pitch mode

2. Specificity (0–5): Did they give a specific, accurate response grounded in how Metaview actually works? This is the core skill. Vague answers that could apply to any product score low.
   - 5: Nailed the root cause of this specific objection with accurate product facts, named specific features or behaviors, and reframed the objection accurately
   - 4: Mostly specific, one detail missing or slightly imprecise
   - 3: Some specifics but leaned on vague language ("we handle that", "it's really easy") for key points
   - 2: Mostly vague — could be describing any software product
   - 1: Touched on something real but significantly missed the core counter
   - 0: Inaccurate, or the response made the objection worse

3. Proof Point (0–3): Did they use a specific customer example or data point to back their claim?
   - 3: Named a specific proof point (Engine: ~40 min/day saved, Riviera: 6–15 hrs/wk, Perk: global hiring quality) tied relevantly to this objection
   - 2: Referenced customer results or data but not specific enough (e.g., "customers save hours")
   - 1: Generic social proof ("many companies use it") with no data
   - 0: No proof point — just assertions

Score = sum of breakdown scores (out of 10)

CRITICAL REQUIREMENT for the "tip" field in each breakdown dimension: Do NOT just diagnose the problem. Give a specific, usable fix. The tip must include exact language the AE can try — written in first person, as if they are saying it to the prospect. If they scored full marks on a dimension, the tip should reinforce what made it work and suggest a slight upgrade. Tips should be 1–2 sentences maximum.

Return ONLY valid JSON:
{
  "score": <sum of 3 dimension scores, 0–10>,
  "verdict": "<one tight sentence on overall quality>",
  "breakdown": {
    "acknowledge": {
      "score": <0-2>,
      "max": 2,
      "feedback": "<one sentence describing what they did or didn't do>",
      "tip": "<specific fix or reinforcement with example language they can say>"
    },
    "specificity": {
      "score": <0-5>,
      "max": 5,
      "feedback": "<one sentence on what was specific or vague>",
      "tip": "<specific fix with the exact Metaview fact or feature they should have named, and how to say it>"
    },
    "proofPoint": {
      "score": <0-3>,
      "max": 3,
      "feedback": "<one sentence on whether and how they used proof>",
      "tip": "<which proof point to use here and exactly how to drop it naturally>"
    }
  },
  "whatWorked": ["<specific thing they did well>"],
  "whatToImprove": ["<specific gap, named concretely>"],
  "modelResponse": "<a strong model response to this specific scenario — first person, conversational, 3-5 sentences, includes acknowledgment + specific Metaview counter + a named proof point>"
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Scenario:\n"${scenario}"\n\nAE's response:\n${answer}` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  })

  const raw = JSON.parse(completion.choices[0].message.content ?? '{}')
  const result: ObjectionGradeResult = {
    ...raw,
    letterGrade: scoreToLetter(raw.score),
  }
  return Response.json(result)
}
