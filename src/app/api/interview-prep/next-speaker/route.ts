import OpenAI from 'openai'
import type { TargetAccount, InterviewPrepTranscriptEntry, StakeholderRole } from '@/lib/interview-prep'

interface RequestShape {
  account: TargetAccount
  recentTranscript: InterviewPrepTranscriptEntry[]
}

interface NextSpeakerResult {
  speaker: StakeholderRole | 'both'
  reasoning: string
}

export async function POST(req: Request) {
  const openai = new OpenAI()
  const { account, recentTranscript } = await req.json() as RequestShape

  const vp = account.stakeholders.vpPeople
  const dir = account.stakeholders.directorTa

  const transcriptText = recentTranscript
    .slice(-12)
    .map((e) => {
      if (e.speaker === 'ae') return `AE (Trisha): ${e.content}`
      if (e.speaker === 'vpPeople') return `${vp.name} [VP People]: ${e.content}`
      return `${dir.name} [Director TA]: ${e.content}`
    })
    .join('\n')

  const systemPrompt = `You are a turn-taking moderator for a roleplay sales call. Two stakeholders are on the call:
- ${vp.name} — ${vp.title}. Concerns: ${vp.concerns.join('; ')}. Lens: strategic, ROI, headcount, board metrics, candidate experience at scale.
- ${dir.name} — ${dir.title}. Concerns: ${dir.concerns.join('; ')}. Lens: tactical, recruiter workflow, ATS integration, day-to-day operations.

Given the recent conversation, decide who should respond next to the AE's last utterance. Pick the stakeholder whose role/concerns most naturally match what was just asked or said. If the AE asked an open question to "the team" or both, and it makes sense for both to weigh in, pick "both" (sparingly — only when natural).

Rules:
- If the AE addressed a stakeholder by name, that stakeholder responds.
- Strategic / ROI / "what does success look like" / board / metrics / budget / timeline → vpPeople
- Tactical / workflow / "how do recruiters do X" / ATS / scorecard adoption / day-in-the-life → directorTa
- If neither stakeholder has spoken in the last 4 turns, lean toward picking the silent one to keep both engaged.
- Default split when ambiguous: pick the one who has spoken less recently.

Return ONLY valid JSON: {"speaker": "vpPeople" | "directorTa" | "both", "reasoning": "<one short sentence>"}`

  const userContent = `Recent transcript (most recent at the bottom):
${transcriptText}

Who should respond now? Return JSON only.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
    max_tokens: 100,
  })

  const raw = completion.choices[0].message.content ?? '{}'
  const result = JSON.parse(raw) as NextSpeakerResult
  return Response.json(result)
}
