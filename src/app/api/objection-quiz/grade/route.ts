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
    acknowledge: { score: number; max: number; feedback: string }
    specificity: { score: number; max: number; feedback: string }
    proofPoint: { score: number; max: number; feedback: string }
    momentum: { score: number; max: number; feedback: string }
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

  const systemPrompt = `You are a rigorous sales coach evaluating an AE's objection handling response. You are grading how well they handled a real prospect objection for Metaview, an AI recruiting platform. Hold a high bar.

Complete Metaview product and objection knowledge:
${METAVIEW_KNOWLEDGE}

The objection being handled: "${objection.objection}"
Key points a strong response should include:
${objection.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Grade across 4 dimensions (output as a breakdown):

1. Acknowledge (0–2): Did they validate the concern before responding? Jumping straight to counter-argument without acknowledging feels dismissive and is a common AE mistake.
   - 2: Genuinely acknowledged the concern with empathy ("That's a completely fair concern — " or similar)
   - 1: Nodded at the concern but moved past it quickly
   - 0: Dismissed or ignored the concern, went straight to pitch mode

2. Specificity (0–3): Did they give a specific, accurate response grounded in how Metaview actually works? Vague answers ("we handle that well") score low.
   - 3: Specific, accurate, addressed the root cause of the objection with real product facts
   - 2: Mostly specific but missed a key detail or was slightly off
   - 1: Vague or generic — could apply to any product
   - 0: Inaccurate or made things worse

3. Proof Point (0–2): Did they use a specific customer example or data point to back up their claim?
   - 2: Relevant, specific proof point (Engine: 40 min/day, Riviera: 6-15 hrs/wk, etc.) tied to this objection
   - 1: Referenced social proof or data but not specific
   - 0: No proof point — just assertions

4. Momentum (0–3): Did they move the conversation forward after handling the objection? Great objection handling doesn't just neutralize — it advances.
   - 3: Handled the objection AND proposed a next step, offered a pilot/trial, or turned it into a qualifying question
   - 2: Handled the objection adequately and moved on
   - 1: Handled the objection but the conversation stalled — no clear forward motion
   - 0: Left the prospect more skeptical or in a worse position than before

Score = sum of breakdown scores (out of 10)

Return ONLY valid JSON:
{
  "score": <sum of breakdown scores, 0–10>,
  "verdict": "<one tight sentence on overall quality>",
  "breakdown": {
    "acknowledge": { "score": <0-2>, "max": 2, "feedback": "<one sentence>" },
    "specificity": { "score": <0-3>, "max": 3, "feedback": "<one sentence>" },
    "proofPoint": { "score": <0-2>, "max": 2, "feedback": "<one sentence>" },
    "momentum": { "score": <0-3>, "max": 3, "feedback": "<one sentence>" }
  },
  "whatWorked": ["<specific thing they did well>", ...],
  "whatToImprove": ["<specific thing to fix>", ...],
  "modelResponse": "<a strong model response to this specific scenario — write it in first person as the AE speaking, conversational, 3-5 sentences, includes acknowledgment + specific counter + proof point + forward motion>"
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Scenario presented to the AE:\n"${scenario}"\n\nAE's response:\n${answer}` },
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
