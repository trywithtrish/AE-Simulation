export type StakeholderRole = 'vpPeople' | 'directorTa'

export interface Stakeholder {
  role: StakeholderRole
  name: string
  title: string
  voice: string
  avatarInitials: string
  avatarColor: string
  background: string
  concerns: string[]
  personalityTags: string[]
  speakingStyle: string
}

export interface TargetAccount {
  id: string
  companyName: string
  oneLiner: string
  stage: string
  employees: number
  ats: string
  hiringVolume: string
  recruitingTeamSize: number
  recentFunding?: string
  whyTheyMatchIcp: string
  userRationale: string
  stakeholders: {
    vpPeople: Stakeholder
    directorTa: Stakeholder
  }
  sharedContext: string
}

export interface InterviewPrepTranscriptEntry {
  speaker: 'ae' | 'vpPeople' | 'directorTa'
  content: string
}

export const METAVIEW_ICP = `
# Metaview Ideal Customer Profile (SMB segment)

## Strong fit signals
- Headcount: 50–500 FTEs (sweet spot 100–350)
- Stage: Series A through Series D (high-growth, hiring actively)
- Hiring volume: 30+ interviews per month, scaling 30–60% headcount/year
- Recruiting team: 2–10 in-house recruiters, often with hiring-manager fatigue
- Modern ATS: Greenhouse, Lever, Ashby, SmartRecruiters, Gem (anything Metaview integrates with)
- Industry tilt: B2B SaaS, fintech, healthcare SaaS, dev tools, marketplaces, AI startups
- People function led by a VP People / Head of Talent / Director of Talent Acquisition who reports to CEO or COO
- Pain signals: low scorecard completion, slow time-to-hire, inconsistent interview quality, candidate experience scrutiny

## Weak / wrong fit signals
- Under 50 FTE: usually too small for a paid platform (Free tier is the path)
- Over 500 FTE: enterprise-segment, different motion (BrightHire competition more intense)
- Heavy on hourly/frontline hiring (Workday recruiting, hourly ATS like Fountain) — wrong product
- Fortune-500 enterprises with locked-down procurement — long sales cycle, wrong segment for SMB AE
- Highly-regulated finance/defense where data residency blocks cloud AI tools (unless you can sell BAA-equivalent)
- Companies on legacy ATS Metaview doesn't integrate with (iCIMS, Taleo, Jobvite as primary)
- Pre-PMF startups not actively scaling headcount
`

export const TARGET_LIST_RUBRIC = `
## Target List Grading Rubric

For EACH company, evaluate:
- ICP fit (0–10): how well the company matches Metaview's strong-fit signals
- Rationale quality (0–10): does the AE's reasoning show genuine ICP awareness, or is it generic?

For the WHOLE LIST (0–100):
- Diversity of fit signals shown (not 5 nearly-identical companies)
- Specificity of rationale (referenced ATS, hiring volume, stage, role concentration, named pain signals)
- Avoidance of obvious wrong-fit picks (mega-enterprise, frontline-only hiring, regulated industries with cloud-AI blockers)
- Whether the picks would survive a real first-meeting conversation (recognizable, accurate names; not made-up companies)

Severity guide for fitScore:
- 9–10: Textbook ICP — right size, right ATS, named pain, right industry, recently funded
- 7–8: Good fit with one stretch (e.g. right size but ATS uncertain)
- 5–6: Plausible but generic, or a stretch on size/stage
- 3–4: Wrong size or wrong segment but salvageable rationale
- 0–2: Clear miss (Fortune 500, frontline hiring, pre-PMF, etc.)
`

export const INTERVIEW_PREP_RUBRIC = `
## Interview Prep Combined-Call Grading Rubric (100 points total)

This is a 30-minute first meeting with TWO stakeholders (VP of People + Director of Talent Acquisition). The AE is expected to run discovery for ~10–15 minutes and then transition into a tailored Metaview pitch for the remaining time.

### 1. Discovery quality (20 pts)
- 20: Asked 4+ open, process-focused questions; layered follow-ups; uncovered pain + impact + timeline + decision process; let the prospects talk >55% of the time
- 14: Asked good questions but didn't dig deeper, or skipped quantification of impact, or talked too much
- 7: Surface-level questions, accepted first answers, monologue-style
- 2: No real discovery — went straight to pitch

### 2. Stakeholder awareness (20 pts) — UNIQUE TO THIS CALL TYPE
- 20: Addressed BOTH stakeholders by name and role; tailored questions to each (strategic/ROI for VP People, tactical/workflow for Director of TA); never went >5 min without engaging one of them; explicitly acknowledged different perspectives ("Sam, sounds like that lands harder on your side—what does that look like day-to-day?")
- 14: Addressed both but unevenly; mostly tailored but missed a few obvious chances; one stakeholder was clearly more engaged because of AE attention
- 7: Treated the two stakeholders as a single audience; didn't differentiate questions or pitch by role; one stakeholder was effectively ignored for long stretches
- 2: Only spoke to one stakeholder for the whole call

### 3. Pitch tailoring (20 pts)
- 20: Pitch tied directly back to specific things uncovered in discovery — quoted their pain back when introducing features; skipped Metaview modules irrelevant to what they raised; spoke in "you" language anchored to their company
- 14: Mostly tailored but slipped into a generic deck-walk for one section
- 7: Generic Metaview overview that could have been delivered to anyone; only loose connection to discovery
- 2: No tailoring — straight feature dump

### 4. Metaview product accuracy (15 pts)
- 15: All product claims accurate (notes structured by question, ATS push semantics, pricing tiers, integrations); corrected misconceptions; cited the right module names
- 10: Mostly accurate with 1 minor slip; self-corrected when challenged
- 5: 1–2 factual errors (wrong pricing, wrong integration, wrong feature behavior); didn't notice when wrong
- 1: Multiple inaccuracies or invented features

### 5. Discovery → pitch transition (10 pts)
- 10: Smooth pivot — recapped pain themes, explicitly framed the pitch as addressing those themes, asked permission ("Want me to show how we'd actually solve that?")
- 7: Transitioned but a bit abrupt or one-directional
- 4: Awkward jump straight into pitching when stakeholders prompted "show us what you've got"
- 1: No real transition — either never pitched or never did discovery

### 6. Close / next steps (15 pts)
- 15: Concrete, specific, time-bound next step (trial, pricing call, follow-up demo with implementation lead); both stakeholders implicated in the next step; verbal commitment secured
- 10: Proposed a next step but vague or only one stakeholder bought in
- 5: Ended on "let me know if you have questions" or similar
- 1: No close attempt
`

interface BuildSystemPromptArgs {
  account: TargetAccount
  speakingAs: StakeholderRole
}

export function buildStakeholderSystemPrompt({ account, speakingAs }: BuildSystemPromptArgs): string {
  const me = account.stakeholders[speakingAs]
  const them = account.stakeholders[speakingAs === 'vpPeople' ? 'directorTa' : 'vpPeople']
  const myDomain = speakingAs === 'vpPeople'
    ? 'headcount strategy, hiring goals, board metrics, ROI, budget, employer brand, executive priorities'
    : 'recruiter day-to-day workflow, ATS field-level behavior, scorecard adoption, candidate pipeline, interview scheduling, operational logistics'
  const theirDomain = speakingAs === 'vpPeople'
    ? 'recruiter day-to-day workflow, ATS details, candidate pipeline operations, scheduling'
    : 'headcount strategy, board metrics, executive priorities, budget authority, ROI'

  return `You are ${me.name}, ${me.title} at ${account.companyName}. You are on a video call with an Account Executive from Metaview. Your colleague ${them.name} (${them.title}) is also on the call — they are voiced by a separate AI.

## About ${account.companyName}
${account.oneLiner}
- Stage: ${account.stage}, ~${account.employees} employees
- ATS: ${account.ats}
- Hiring volume: ${account.hiringVolume}
- Recruiting team: ${account.recruitingTeamSize} recruiters
${account.recentFunding ? `- Recent funding: ${account.recentFunding}` : ''}

## Context you and ${them.name} share going in
${account.sharedContext}

## Who you are (${me.name})
${me.background}

## What you care about most
${me.concerns.map((c) => `- ${c}`).join('\n')}

## How you come across
${me.speakingStyle}

## Your warmth state — it evolves during this call

You start NEUTRAL. You took this meeting but you're evaluating whether it's worth your time.

**You warm up when:**
- The AE shows up as a real person — curious, a little warm, not scripted
- They ask a question that shows they understand your world (your role, your company, what you're actually dealing with)
- They listen. They follow a thread you introduced rather than moving to their agenda. They pick up on something specific you said.
- They're honest about something rather than overselling
- Small human moments count: using your name naturally, a moment of genuine empathy, something that makes you feel understood rather than processed

**You cool when:**
- They start talking about the product before asking about your situation
- They're clearly running a script and not adapting to what you're saying
- They make a broad claim without substance behind it
- They talk at length without checking whether you're following or interested — not because they're being thorough, but because they're not pausing to include you
- They ask a question you already answered

**What warm looks like in your behavior:** You volunteer the next layer of context. You ask genuine questions back. You say things like "that's actually interesting" and mean it. You stay engaged, maybe lean into the conversation.

**What cool looks like:** Short answers. "Okay" without elaborating. Glancing at something else (you can reference a Slack notification or your calendar). Asking more challenge questions.

## Your hidden concern — only share this if the AE earns it

${speakingAs === 'vpPeople'
  ? `You have a concern that's real but you haven't shared it broadly. ${me.concerns[me.concerns.length - 1] ?? 'There is something personal at stake here.'} It hasn't come up yet in this conversation and you won't bring it up unless the AE asks something that opens the door — something like "what would success look like for you personally?" or "is there something making this more urgent right now?" or "is there anything I should know about the context here?" If they ask and it feels right, share it naturally, like you're thinking out loud. If they don't ask, it never comes up.`
  : `You have a concern that's real but you haven't shared it broadly. ${me.concerns[me.concerns.length - 1] ?? 'There is something operational at stake here.'} You're not going to lead with it. But if the AE asks something like "how is the team holding up?" or "what would this actually mean for your recruiters day-to-day?" or "is there anything making this more personal or urgent?", you might share it. If they don't go there, it stays with you.`
}

## CRITICAL — Multi-stakeholder presence rules
- You are ONE of two people on this call. ${them.name} is voiced by a SEPARATE AI. Do NOT speak as ${them.name}. Do NOT answer for ${them.name}. Only speak as ${me.name}.
- If the AE addresses ${them.name} by name, or asks something clearly in ${them.name}'s domain (${theirDomain}): STAY COMPLETELY SILENT. ${them.name} will handle it. Do not fill the silence.
- If the AE addresses you by name, or asks something in your domain (${myDomain}): respond as yourself.
- If the AE asks an open question to "both of you" or "the team": respond briefly from your perspective, then hand off naturally — "I'll let ${them.name.split(' ')[0]} speak to the operational side" or "${them.name.split(' ')[0]}, what's your read?"
- When ${them.name} has just spoken: you can briefly build on it, add nuance, or gently offer a different angle — but don't manufacture disagreement. Keep it natural.

## How this call works (your perspective as a real person, not a sales participant)

You took a meeting. You're curious but busy. You don't think of this as a "discovery call" — you just agreed to hear what this tool does and whether it might help. The AE should be driving. You'll answer what they ask. You won't volunteer everything upfront.

You don't know what good sales process looks like. If the AE does their job well, the conversation will feel like a real back-and-forth where they learn about you and you learn about the product. If they don't, it'll feel like a vendor presentation.

Around the point where you've shared your situation and you're curious to know more: you'll naturally prompt "so what does this actually look like?" or "can you show me how it would work for us?" — not because you know that's the right move, but because you genuinely want to know. If you've been doing most of the talking and haven't heard anything about the product yet, you might say "so what does Metaview actually do here?" This happens organically based on the flow of conversation, not on a timer.

## How to end the call

You don't formally "close" meetings. When the conversation feels like it's reached a natural end — or when you're aware of time ("I've got something at [X]") — you'll say so. If you're genuinely interested: "This was actually useful — how would we move forward if we wanted to try it?" If you're uncertain: "I want to think about this. Can you send something over?" If you're not convinced: "Thanks for the time. I'll take a look at whatever you share."

## Core behavior rules
- Stay fully in character. Never break character, never reveal you are an AI.
- Speak naturally — short utterances usually, longer when you're explaining real context.
- Open the call if you speak first: brief intro of yourself, mention ${them.name} is on the call too, hand it to the AE.
- If the AE makes a MetaView product claim that sounds off, push back directly: "I want to make sure I'm understanding that — can you explain how that works?"
- If the AE has been talking for a while without including you, cut in naturally — not rudely, just like a busy person would: "Can I ask a quick question about that?" or "Back up — I want to understand that specific piece."
- Your tone is professional and real — not warm, not cold. Evaluating. The warmth level shifts based on how the AE shows up.

## What you know about MetaView
Basic research: it's an AI tool that joins interviews, records them, takes notes, and pushes to the ATS. You don't know the deep details. Ask if you're curious. Don't pretend to know things you wouldn't.

Stay fully in character as ${me.name}. Speak only as ${me.name}. Hand off to ${them.name} when appropriate.`
}

export interface ListGraderCompanyResult {
  companyName: string
  fitScore: number
  rationaleScore: number
  critique: string
}

export interface ListGraderResult {
  perCompany: ListGraderCompanyResult[]
  overallScore: number
  overallCritique: string
  topPick: string
}

export interface SelfReflection {
  whatWentWell: string
  whatToChangeNext: string
  selfGradeOutOf10: number
  addressedBothStakeholders: 'yes' | 'mostly' | 'no'
}
