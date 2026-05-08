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
  "summary": "<3-4 sentences on overall discovery performance — be specific about what they did and didn't uncover>",
  "categories": [
    {
      "name": "Question Quality",
      "score": <0-20>,
      "maxScore": 20,
      "feedback": "<3-4 sentences specific to this transcript. Name at least one actual question they asked — quote it — and explain why it worked or didn't.>"
    },
    {
      "name": "Layered Follow-Ups",
      "score": <0-25>,
      "maxScore": 25,
      "feedback": "<3-4 sentences. Identify a specific moment they followed up well (if any) and a specific moment they moved on too early. Quote Riley's answer that deserved a follow-up.>"
    },
    {
      "name": "Quantification",
      "score": <0-20>,
      "maxScore": 20,
      "feedback": "<3-4 sentences. Name which numbers they got out of Riley (if any) and which specific numbers they left on the table. Be explicit.>"
    },
    {
      "name": "Pain → Impact",
      "score": <0-15>,
      "maxScore": 15,
      "feedback": "<3-4 sentences. Did they connect any pain to a business consequence? Name the specific impact stories they surfaced vs. missed.>"
    },
    {
      "name": "Stakeholder Mapping",
      "score": <0-10>,
      "maxScore": 10,
      "feedback": "<2-3 sentences. Did they ask who else is involved? Name what they found (if anything) and what they missed (CFO, VP Eng).>"
    },
    {
      "name": "Listening Discipline",
      "score": <0-10>,
      "maxScore": 10,
      "feedback": "<2-3 sentences. Did they pitch? Did they interrupt? Were they reactive to what Riley actually said?>"
    }
  ],
  "painLayersUncovered": [
    {
      "layer": "surface",
      "description": "Surface pain (scorecard completion, HM inconsistency)",
      "unlocked": <boolean>,
      "unlockingQuote": "<the exact AE question or statement that unlocked this layer, or null>",
      "exampleUnlockQuestion": "<a full sentence question the AE could say to unlock this>"
    },
    { "layer": "impact", "description": "Impact pain (lost candidate, TTH, senior engineer dropout)", "unlocked": <bool>, "unlockingQuote": "<or null>", "exampleUnlockQuestion": "..." },
    { "layer": "urgency", "description": "Urgency/strategic stakes (Series C, CEO mandate, board pressure)", "unlocked": <bool>, "unlockingQuote": "<or null>", "exampleUnlockQuestion": "..." },
    { "layer": "buyingGroup", "description": "Buying group (CFO approval, VP Eng involvement)", "unlocked": <bool>, "unlockingQuote": "<or null>", "exampleUnlockQuestion": "..." },
    { "layer": "personal", "description": "Personal stake (role at risk, prior trauma)", "unlocked": <bool>, "unlockingQuote": "<or null>", "exampleUnlockQuestion": "..." }
  ],
  "missedOpportunities": [
    {
      "rileyQuote": "<exact words Riley said that the AE didn't dig into — must be a direct quote>",
      "whatYouDid": "<what the AE actually did next — moved on, asked something unrelated, pitched, etc. Be specific.>",
      "betterFollowUp": "<the exact follow-up question the AE should have asked, written in first person as if the AE is saying it>",
      "whyItMatters": "<one sentence: what deeper information this would have unlocked>"
    }
  ],
  "strengthsMoments": [
    {
      "aeQuote": "<exact words the AE said that demonstrated good discovery technique>",
      "whyGood": "<1-2 sentences explaining specifically why this worked — what principle it demonstrates>"
    }
  ],
  "questionRewrites": [
    {
      "originalQuestion": "<exact weak or closed question the AE asked — must be a direct quote>",
      "betterVersion": "<the rewritten question — same intent, better technique, full sentence the AE could say verbatim>",
      "whyBetter": "<one sentence explaining the technique difference — e.g. 'open-ended instead of yes/no', 'asks about impact not feature', etc.>"
    }
  ],
  "topRecommendations": [
    {
      "skill": "<discovery skill name — e.g. 'Layered follow-ups', 'Quantification', 'Impact bridging'>",
      "advice": "<3-4 sentences of specific coaching tied to what happened in this transcript. Don't be generic. Name the actual moment.>",
      "exampleQuestion": "<full sentence the AE could say verbatim next time — not a template>"
    }
  ]
}

CRITICAL:
- Be specific. Quote exact moments from the transcript. Zero generic advice.
- missedOpportunities: identify 5–7 specific moments. Every entry needs the exact Riley quote and an exact rewritten follow-up.
- strengthsMoments: identify 2–3 things the AE genuinely did well — specific quotes with explanation. If they did nothing well, find the least bad moments and explain what principle they were accidentally applying.
- questionRewrites: pick 2–3 actual weak questions from the transcript and rewrite them. Only use questions the AE actually asked — do not invent examples.
- topRecommendations: give 5 prioritized recommendations, most important first. Each must name a real moment from the call and give a verbatim example question.
- If they uncovered nothing in a pain layer, unlockingQuote should be null.
- Hold a high bar. Discovery is genuinely hard — don't grade easy.`

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
