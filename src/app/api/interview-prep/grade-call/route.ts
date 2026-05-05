import OpenAI from 'openai'
import { METAVIEW_KNOWLEDGE } from '@/lib/metaview'
import { INTERVIEW_PREP_RUBRIC, type InterviewPrepTranscriptEntry, type TargetAccount } from '@/lib/interview-prep'
import type { GradeResult } from '@/app/api/grade/route'

interface RequestShape {
  transcript: InterviewPrepTranscriptEntry[]
  account: TargetAccount
}

export async function POST(req: Request) {
  const openai = new OpenAI()
  const { transcript, account } = await req.json() as RequestShape

  const vp = account.stakeholders.vpPeople
  const dir = account.stakeholders.directorTa

  const transcriptText = transcript
    .map((e) => {
      if (e.speaker === 'ae') return `AE (Trisha): ${e.content}`
      if (e.speaker === 'vpPeople') return `${vp.name} [VP People]: ${e.content}`
      return `${dir.name} [Director TA]: ${e.content}`
    })
    .join('\n\n')

  const systemPrompt = `You are an elite sales coach evaluating a Metaview AE's performance on a first meeting with two stakeholders at a target account.

Metaview product knowledge:
${METAVIEW_KNOWLEDGE}

Grading rubric:
${INTERVIEW_PREP_RUBRIC}

Account context:
- Company: ${account.companyName} (${account.stage}, ~${account.employees} employees)
- ATS: ${account.ats}
- Hiring volume: ${account.hiringVolume}
- Recruiting team: ${account.recruitingTeamSize} recruiters
- Why they're a Metaview fit: ${account.whyTheyMatchIcp}

Stakeholders on the call:
- ${vp.name}, ${vp.title} — concerns: ${vp.concerns.join('; ')}
- ${dir.name}, ${dir.title} — concerns: ${dir.concerns.join('; ')}

The AE is Trisha. Evaluate their performance rigorously against the rubric. For the "Stakeholder awareness" category specifically, analyze:
- How many transcript turns addressed each stakeholder by name
- Whether questions to the VP People were strategic (ROI, metrics, timeline) vs tactical (workflow, ATS, day-to-day)
- Whether questions to the Director TA were tactical rather than generic
- Whether the AE ignored one stakeholder for >5 minutes at a stretch

For the "recommendations" field: each entry must be genuinely actionable and specific to this call. Do not write vague advice like "do more discovery." Instead, name the specific moment or gap from this transcript, explain the exact behavior change, and write the real words the AE could say in a future call. The exampleLanguage must be a complete sentence or two — something she could actually say out loud, not a fill-in-the-blank template.

Return ONLY valid JSON in this exact shape:
{
  "overallGrade": "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F",
  "overallScore": <number 0-100>,
  "callType": "interview-prep",
  "personaName": "${vp.name} & ${dir.name}",
  "categories": [
    {
      "name": "<category name from rubric>",
      "score": <number>,
      "maxScore": <max points for this category>,
      "feedback": "<2-3 sentence specific feedback referencing the transcript>",
      "examples": ["<exact quote or moment>"]
    }
  ],
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<specific area 1>", "<area 2>", "<area 3>"],
  "recommendations": [
    {
      "area": "<which skill or category this addresses>",
      "action": "<one concrete thing to try differently — specific behavior, not a platitude>",
      "exampleLanguage": "<exact words the AE could say on a real call — first person, complete sentence(s)>"
    }
  ],
  "coachingMoments": [
    {
      "quote": "<exact quote from transcript>",
      "issue": "<what went wrong>",
      "betterApproach": "<specific language to use instead>"
    }
  ],
  "summary": "<2-3 sentence overall assessment>"
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Grade this interview-prep call transcript:\n\n${transcriptText}` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const result = JSON.parse(completion.choices[0].message.content ?? '{}') as GradeResult
  return Response.json(result)
}
