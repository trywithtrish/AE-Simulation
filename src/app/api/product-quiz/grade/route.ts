import OpenAI from 'openai'
import { METAVIEW_KNOWLEDGE } from '@/lib/metaview'
import type { ProductQuestion } from '@/lib/quiz'

interface RequestShape {
  question: ProductQuestion
  prompt: string
  answer: string
}

export interface QuizGradeResult {
  score: number
  letterGrade: string
  verdict: string
  whatYouGotRight: string[]
  whatYouMissed: string[]
  correctAnswer: string
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
  const { question, prompt, answer } = await req.json() as RequestShape

  const systemPrompt = `You are a rigorous Metaview product knowledge trainer evaluating an AE's answer to a product question. Hold a high bar — vague or partially correct answers do NOT score well. The AE needs to know this cold to be credible in front of prospects.

Complete Metaview product knowledge:
${METAVIEW_KNOWLEDGE}

The question topic is: ${question.topic}
Key points a correct answer MUST cover:
${question.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Scoring (0–10):
- 9–10: Accurate on all key points, no errors, could say this confidently in front of a skeptical prospect
- 7–8: Got the main idea but missed 1 key point or had a minor inaccuracy
- 5–6: Partially correct but missing important specifics or had a notable error
- 3–4: Got some pieces right but significant gaps or incorrect claims
- 0–2: Wrong, incomplete to the point of being misleading, or could actively hurt a deal if said to a prospect

Penalize: inventing features that don't exist, wrong pricing, wrong integration lists, wrong proof point numbers.
Reward: specific, accurate, well-framed answers that would actually land in a real prospect conversation.

Return ONLY valid JSON:
{
  "score": <0.0–10.0 with one decimal>,
  "verdict": "<one tight sentence: overall assessment>",
  "whatYouGotRight": ["<specific thing they got right>", ...],
  "whatYouMissed": ["<specific thing missing or wrong>", ...],
  "correctAnswer": "<a model answer covering all key points — write it as if you're the AE saying it to a prospect, concise and confident>"
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Question asked: "${prompt}"\n\nAE's answer:\n${answer}` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  })

  const raw = JSON.parse(completion.choices[0].message.content ?? '{}')
  const result: QuizGradeResult = {
    ...raw,
    letterGrade: scoreToLetter(raw.score),
  }
  return Response.json(result)
}
