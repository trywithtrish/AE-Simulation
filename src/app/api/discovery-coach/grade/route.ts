import OpenAI from 'openai'
import { METAVIEW_KNOWLEDGE } from '@/lib/metaview'
import { DISCOVERY_DEEP_DIVE_RUBRIC, type DiscoveryGradeResult } from '@/lib/discovery-coach'

interface TranscriptEntry {
  role: 'user' | 'assistant'
  content: string
}

interface RequestShape {
  transcript: TranscriptEntry[]
}

function scoreToLetter(score: number): string {
  if (score >= 95) return 'A+'
  if (score >= 90) return 'A'
  if (score >= 85) return 'A-'
  if (score >= 80) return 'B+'
  if (score >= 75) return 'B'
  if (score >= 70) return 'B-'
  if (score >= 65) return 'C+'
  if (score >= 60) return 'C'
  if (score >= 55) return 'C-'
  if (score >= 50) return 'D'
  return 'F'
}

export async function POST(req: Request) {
  const openai = new OpenAI()
  const { transcript } = await req.json() as RequestShape

  const aeWords = transcript
    .filter((t) => t.role === 'user')
    .reduce((sum, t) => sum + t.content.split(/\s+/).length, 0)
  const rileyWords = transcript
    .filter((t) => t.role === 'assistant')
    .reduce((sum, t) => sum + t.content.split(/\s+/).length, 0)
  const totalWords = aeWords + rileyWords
  const aePercent = totalWords > 0 ? Math.round((aeWords / totalWords) * 100) : 0
  const rileyPercent = 100 - aePercent

  const transcriptText = transcript
    .map((t) => `${t.role === 'user' ? 'AE (Trisha)' : 'Riley Chen (Director of Talent, Attio)'}: ${t.content}`)
    .join('\n\n')

  const systemPrompt = `You are an elite sales coach evaluating an AE's discovery skill on a practice call. The AE was talking with Riley Chen, Director of Talent at Attio (an AI-native CRM company).

This was a DISCOVERY-ONLY exercise. There was no demo, no pitch. The AE's job was purely to uncover Riley's situation, pain, impact, urgency, and decision context. Grade rigorously against the discovery rubric.

Metaview product knowledge (for context, but the AE shouldn't have been pitching):
${METAVIEW_KNOWLEDGE}

Riley Chen's full situation (so you know what good discovery WOULD have uncovered — use this to identify what they uncovered vs missed):

**Surface layer (revealed by open process questions):**
- Hiring fast post-Series B, ~48 employees, scaling to 80
- Scorecard completion in Ashby is ~45%
- 4 of 7 hiring managers consistently submit on time
- Engineers are the worst offenders on feedback

**Impact layer (revealed by "what's the cost?" follow-ups):**
- Lost a senior AE candidate to Linear last quarter — debrief took 9 days
- Time-to-hire is 28 days, target is under 18
- Senior engineers drop out of cycles by day 21 (cycles run 30+ days)
- No candidate NPS data because nobody writes structured notes

**Urgency layer (revealed by timeline/strategic questions):**
- Series C conversations expected in 6–9 months
- CEO told Riley: "I want hiring to be a competitive advantage by Q3"
- Michael McBride (new board member, ex-GitLab CRO) asking pointed questions about hiring funnel data

**Buying group layer (revealed by "who else is involved?"):**
- CFO Andrew approves any tool over $5K/year
- VP Engineering Mark must bless anything that touches engineering interview workflow
- Mark has been burned by recruiting tooling before

**Personal layer (revealed by genuinely human questions):**
- Riley was hired 6 months ago specifically to fix this
- If Riley can't show measurable progress in 12 months, their role is at risk
- Watched a peer get fired for badly-scaled hiring at last company — pressure is personal

${DISCOVERY_DEEP_DIVE_RUBRIC}

Return ONLY valid JSON in this exact shape:
{
  "overallGrade": "<letter A+ through F>",
  "overallScore": <0-100>,
  "summary": "<2-3 sentences on overall discovery performance>",
  "categories": [
    {
      "name": "Question Quality",
      "score": <0-20>,
      "maxScore": 20,
      "feedback": "<2-3 sentences specific to this transcript>"
    },
    {
      "name": "Layered Follow-Ups",
      "score": <0-25>,
      "maxScore": 25,
      "feedback": "<2-3 sentences>"
    },
    {
      "name": "Quantification",
      "score": <0-20>,
      "maxScore": 20,
      "feedback": "<2-3 sentences>"
    },
    {
      "name": "Pain → Impact",
      "score": <0-15>,
      "maxScore": 15,
      "feedback": "<2-3 sentences>"
    },
    {
      "name": "Stakeholder Mapping",
      "score": <0-10>,
      "maxScore": 10,
      "feedback": "<1-2 sentences>"
    },
    {
      "name": "Listening Discipline",
      "score": <0-10>,
      "maxScore": 10,
      "feedback": "<1-2 sentences>"
    }
  ],
  "painLayersUncovered": [
    {
      "layer": "surface",
      "description": "Surface pain (scorecard completion, HM inconsistency)",
      "unlocked": <boolean>,
      "unlockingQuote": "<the AE question that unlocked this layer, if any>",
      "exampleUnlockQuestion": "<example question the AE could have used to unlock this if they didn't>"
    },
    { "layer": "impact", "description": "Impact pain (lost candidate, TTH, senior engineer dropout)", "unlocked": <bool>, "unlockingQuote": "<or null>", "exampleUnlockQuestion": "..." },
    { "layer": "urgency", "description": "Urgency/strategic stakes (Series C, CEO mandate, board pressure)", "unlocked": <bool>, "unlockingQuote": "<or null>", "exampleUnlockQuestion": "..." },
    { "layer": "buyingGroup", "description": "Buying group (CFO approval, VP Eng involvement)", "unlocked": <bool>, "unlockingQuote": "<or null>", "exampleUnlockQuestion": "..." },
    { "layer": "personal", "description": "Personal stake (role at risk, prior trauma)", "unlocked": <bool>, "unlockingQuote": "<or null>", "exampleUnlockQuestion": "..." }
  ],
  "missedOpportunities": [
    {
      "rileyQuote": "<exact thing Riley said that the AE didn't dig into>",
      "whatYouDid": "<what the AE actually did instead — moved on, pitched, etc>",
      "betterFollowUp": "<the exact follow-up question the AE should have asked, written in first person they could say it>",
      "whyItMatters": "<one sentence on what they would have unlocked>"
    }
  ],
  "topRecommendations": [
    {
      "skill": "<which discovery skill — e.g. 'Quantification', 'Layered follow-ups'>",
      "advice": "<specific advice tied to this transcript>",
      "exampleQuestion": "<exact words the AE could use next time>"
    }
  ]
}

CRITICAL:
- Be specific. Quote exact moments. No generic advice.
- For missedOpportunities, identify 3–5 specific moments. Each must include the exact Riley quote and the exact follow-up the AE should have asked.
- For topRecommendations, give 3 prioritized recommendations with example questions written as full sentences the AE could say.
- exampleQuestion must be a real question they could say verbatim — not a template.
- If they uncovered nothing in a layer, the unlockingQuote should be null.
- Hold a high bar. Discovery is a hard skill — don't grade easy.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Discovery call transcript:\n\n${transcriptText}\n\nGrade this AE's discovery skill against the rubric.` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const raw = JSON.parse(completion.choices[0].message.content ?? '{}')
  const result: DiscoveryGradeResult = {
    ...raw,
    overallGrade: raw.overallGrade ?? scoreToLetter(raw.overallScore ?? 0),
    talkRatio: {
      aePercent,
      rileyPercent,
      note: rileyPercent >= 60
        ? 'Healthy — Riley talked more than you, which is what good discovery looks like.'
        : rileyPercent >= 50
          ? 'Roughly balanced. For discovery, aim for the prospect talking 60%+ of the time.'
          : aePercent >= 60
            ? 'You talked more than Riley. In discovery, this usually means you pitched too much or asked closed questions. Aim for Riley to talk 60%+.'
            : 'Riley led the conversation. In discovery, the AE should be driving with questions while the prospect does most of the talking.',
    },
  }
  return Response.json(result)
}
