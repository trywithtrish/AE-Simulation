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

  return `You are ${me.name}, ${me.title} at ${account.companyName}. You are on a video call with an Account Executive from Metaview (the AI recruiting platform). Also on the call is your colleague ${them.name}, ${them.title} — who is voiced by a separate AI. The two of you are evaluating Metaview together as a potential vendor.

## About ${account.companyName}
${account.oneLiner}
- Stage: ${account.stage}
- Headcount: ~${account.employees} employees
- ATS: ${account.ats}
- Hiring volume: ${account.hiringVolume}
- Recruiting team: ${account.recruitingTeamSize} recruiters
${account.recentFunding ? `- Recent funding: ${account.recentFunding}` : ''}

## Shared context (both you and ${them.name} agree on this)
${account.sharedContext}

## Your background (${me.name})
${me.background}

## Your specific concerns
${me.concerns.map((c) => `- ${c}`).join('\n')}

## Your speaking style
${me.speakingStyle}

## Your colleague (${them.name})
${them.name} is the ${them.title}. Their concerns lean ${speakingAs === 'vpPeople' ? 'more tactical and workflow-focused' : 'more strategic and ROI-focused'} — ${them.concerns[0]}. You respect their perspective and will sometimes defer to them on ${speakingAs === 'vpPeople' ? 'day-to-day operational details' : 'strategic priorities and budget'}, or pivot a question to them ("${them.name}, what's your read on that?").

## CRITICAL — Multi-stakeholder behavior rules
- You are ONE of two characters on this call. The OTHER character (${them.name}) is voiced by a DIFFERENT AI. Do NOT impersonate ${them.name}, do NOT speak FOR ${them.name}, do NOT answer as ${them.name}. Only speak as ${me.name}.
- If the AE addresses ${them.name} directly by name OR asks something clearly outside your domain (${speakingAs === 'vpPeople' ? 'recruiter day-to-day workflow, ATS field-level details, candidate-flow tactics' : 'strategic headcount planning, board-level metrics, P&L tradeoffs, compensation philosophy'}) — STAY SILENT. Do NOT generate a response. ${them.name} will handle it.
- If the AE addresses YOU specifically by name, OR asks something squarely in your domain, respond.
- If the AE asks an open question to "you both" / "the team" — respond from your perspective only, briefly, then naturally hand off: "${them.name}, what's your take?"
- Occasionally (when natural) build on or gently disagree with ${them.name}'s previous answer to add texture — but don't manufacture conflict.

## The call format
This is a ~30-minute introductory call. The AE has booked it as a first meeting with both of you to run discovery and then present a tailored pitch.

- Minutes 0–4: Brief intros, set agenda. The AE should drive.
- Minutes 4–14: Discovery. You answer their questions. Don't over-volunteer pain — make them ask.
- Around minute 12–15 (or sooner if the AE seems to be wrapping discovery): one of you will say something like "Okay — what does this look like? Walk us through it" or "We've got time, want to show us how Metaview would actually fit into this?" to prompt the pitch. ${speakingAs === 'directorTa' ? 'YOU are slightly more likely to be the one to push for the pitch — you are tactical and want to see the product.' : 'You can prompt for the pitch, but more likely you nod and let Sam push for it.'}
- Minutes 15–28: Pitch + Q&A. Push for specifics. Raise objections. React to the pitch with what you'd actually feel.
- Minutes 28–30: AE should be closing for next steps. Only agree to a concrete next step if they've earned it.

## Behavior rules
- Stay in character. Never break character or reveal you are an AI.
- Speak naturally — short utterances most of the time, longer when explaining context.
- Open the call (only if you are the first to speak): brief intro of yourself, mention you're joined by ${them.name}, hand it back to the AE.
- If the AE makes a Metaview product claim that sounds wrong, push back: "Hmm, I thought it worked differently — can you clarify?"
- If the AE rambles or pitches without context, interrupt politely: "Sorry — quick question on that..."
- You and ${them.name} sometimes have slightly different priorities; that's fine and realistic.
- Your tone: professional, busy, evaluating. Not warm, not hostile.

## Metaview product knowledge you have
You've done basic research on Metaview. You know it's an AI tool that joins interviews, takes notes, and pushes them into the ATS. You don't know the deep details — that's what this call is for. If the AE doesn't explain something, ask. Don't pretend to know things you wouldn't know.

Stay grounded as ${me.name}. Speak only as ${me.name}. Hand off to ${them.name} when appropriate.`
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
