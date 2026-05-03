export const METAVIEW_KNOWLEDGE = `
# MetaView — Complete Product Knowledge Base (for AE evaluation)

## What MetaView Is
MetaView is an AI recruiting platform built specifically for hiring teams. It is NOT a general-purpose meeting recorder. Its AI is trained specifically on hiring conversations—it understands the difference between a salary expectation, a competency signal, and a culture fit flag. This specialization is its core differentiator.

It has four modules: Notetaker, Reports, Job Posts, and Candidate Search (AI Sourcing). Companies can start with one and expand.

---

## Module 1: Notetaker
The MetaView bot joins video calls (Zoom, Google Meet, Microsoft Teams) automatically once connected to your calendar. Candidates see a notification that the call is being recorded.

What it produces:
- A full transcript of the interview
- Structured notes organized by QUESTION ASKED—not by timestamp. This is a key differentiator from tools like Otter.ai.
- Notes capture: salary expectations, technical competency signals, culture fit signals, red flags, specific candidate responses per question
- Notes auto-sync into the ATS scorecard (Greenhouse, Lever, Ashby, Gem, SmartRecruiters, Workday, Bullhorn)
- Scorecards are partially auto-filled: objective facts are filled in, subjective sections have AI suggestions based on the transcript

Setup time: under 45 seconds to get running. MetaView connects to your calendar and auto-joins all interviews matching criteria you set.

---

## Module 2: Reports
Post-interview summaries and analytics:
- Per-interview summaries available minutes after the call
- Interviewer-level performance data: who asks good questions, who's consistent, talk/listen ratios
- Candidate comparison across multiple finalists ("What did the three finalists say about remote work?")
- Trend reports: which roles are taking longest, where candidates drop off
- AI Governance: teams can define rules for what the AI should and shouldn't do. Audit trail of AI reasoning.
- Alerts for non-compliant interview behavior (e.g., illegal questions asked)

This is often the hook for talent directors—gives them visibility they've never had before.

---

## Module 3: Job Posts
AI-generated job descriptions:
- MetaView builds an Ideal Candidate Profile (ICP) from your job description
- ICP continuously improves based on hiring decisions (who got offers, who got hired, exit feedback)
- Factors in team-level preferences and role-specific criteria
- Reduces time spent writing JDs and improves quality/consistency

---

## Module 4: Candidate Search / AI Sourcing
Rediscovers and re-engages existing talent in your ATS:
- Available for Ashby, Bullhorn, Ezekia, Greenhouse, Gem, Loxo, SmartRecruiters customers
- Searches your existing ATS database using AI to surface candidates who may fit new roles
- Reduces time spent on outbound sourcing for high-volume roles

---

## Integrations (Critical for AE to Know)
Video: Zoom, Google Meet, Microsoft Teams
ATS (notes push): Greenhouse, Lever, Ashby, Gem, SmartRecruiters, Workday
ATS (AI Sourcing): Ashby, Bullhorn, Ezekia, Greenhouse, Gem, Loxo, SmartRecruiters
Calendar: Google Calendar, Outlook
SSO: Supported

Greenhouse integration specifics: MetaView pushes structured notes directly into Greenhouse scorecards. The AE should know: notes appear as a structured scorecard, NOT just as a PDF attachment. Interviewers can review MetaView's AI draft and edit before submitting. This is key for reducing HM friction.

Lever integration specifics: Similar to Greenhouse—notes sync to candidate profiles and can populate feedback forms.

Ashby integration: Full two-way sync.

---

## Pricing
- Free tier: 5 interviews (good for pilots)
- Pro: $50/month per user
- Enterprise: Custom pricing (volume discounts, SSO, advanced governance, dedicated CSM)
- Enterprise is appropriate for teams doing 100+ interviews/month or needing compliance features

Common mistake: AEs sometimes quote per-seat when the customer needs to think about it per-recruiter, not per-hiring-manager. MetaView licenses are for the recruiters/coordinators who manage the process, not every hiring manager.

---

## Key Differentiators
1. **Hiring-specific AI**: Unlike Otter.ai, Fireflies, or Zoom AI Summary, MetaView's AI understands hiring context. It knows what salary expectations look like, what a technical competency signal is.
2. **Organized by question, not time**: Competing tools give you a timestamped transcript. MetaView gives you notes per interview question, which is what hiring teams actually need.
3. **ATS-native**: Notes push directly into scorecards, not as attachments or separate documents.
4. **Interviewer analytics**: Unique in the market—most tools don't show you which interviewers are performing.
5. **AI Governance**: Compliance-ready with audit trails and rule-setting for what the AI can/can't flag.

---

## Competitors
- **Otter.ai / Fireflies / Zoom AI**: General transcription tools. Not hiring-specific. Don't integrate with ATS. Don't understand competency frameworks.
- **BrightHire**: Direct competitor in interview intelligence. More enterprise-focused, higher price point.
- **Sherlock AI**: Newer entrant, smaller customer base.
- **Gem**: ATS/CRM that added some AI—not a dedicated interview intelligence tool.

When a prospect says they "use Otter.ai"—correct response is to acknowledge it's a great transcription tool, but explain it doesn't understand hiring context or integrate with their ATS. The output is a raw transcript, not structured scorecard notes.

---

## Customer Proof Points (AE Must Know These Cold)
1. **Engine**: Recruiters saved ~40 minutes per day previously spent writing screening notes and submitting scorecards.
2. **Riviera Partners** (80-person recruiting firm): Average of 6+ hours saved per recruiter per week. Some saved up to 15 hours.
3. **Perk**: Enabled high-quality global hiring at scale—recruiters could focus on candidates instead of notes.
4. General benchmark: 3–5 hours saved per recruiter per week.

---

## Common Objections & How to Handle Them
**"Candidates won't want to be recorded."**
MetaView notifies candidates at the start of the call. Candidates see a banner/message. Recording consent is standard in modern recruiting—most candidates are fine with it. If a candidate declines, you can turn off recording for that session.

**"We already use Otter.ai / Zoom transcription."**
Acknowledge the tool. Then explain: "Otter gives you a transcript. MetaView gives you structured scorecard notes organized by competency, pushed directly into Greenhouse. The output is completely different."

**"Our ATS already has a notes field."**
"Yes, and the problem is that nobody fills it in reliably. MetaView creates a first draft automatically—your hiring managers edit and submit instead of starting from scratch. That's why adoption rates are much higher."

**"We tried something like this before and nobody used it."**
This is the toughest objection. Response: "What did rollout look like? [Listen.] The biggest driver of adoption we see is that MetaView makes the hiring manager's life easier, not harder. They don't have to take notes at all—the AI does it. Then they just review and click submit. When something saves people time instead of adding steps, adoption looks very different."

**"We're too small for this."**
"We have a free tier for up to 5 interviews. You can run a pilot without any commitment. And our Pro plan is $50/user/month—for one recruiter, that's the cost of about 30 minutes of their time."

**"HIPAA / data privacy / compliance?"**
MetaView stores data in the US on AWS, encrypted at rest and in transit. Enterprise plans include data retention controls, GDPR compliance, and audit trails. For healthcare companies: MetaView can sign a BAA. Data is not used to train AI models.

**"What about the Greenhouse integration specifically—does it fill out our custom scorecard?"**
MetaView syncs with your existing Greenhouse scorecard template. It populates fields based on the transcript. Custom fields are supported. The hiring manager still reviews and submits—MetaView doesn't auto-submit.

---

## What Great Discovery Questions Look Like (for grading)
- "Walk me through what happens after an interview ends at your company. Who writes what, and when?"
- "How often do hiring managers submit their scorecard feedback on the same day as the interview?"
- "When you look at the feedback that's submitted—how useful is it for making a decision?"
- "What happens when you get to debrief and half the interviewers haven't submitted yet?"
- "How does that impact your time-to-hire?"
- "If you could wave a magic wand and change one thing about your interview process, what would it be?"
- "Who else on your team would need to be involved in a decision like this?"
- "What's your timeline for solving this problem?"

## What Great Demo Behaviors Look Like (for grading)
- Start by recapping specific pain points from discovery, not with "let me show you how MetaView works"
- Show the features that match THIS prospect's pain (don't show Job Posts to someone who only cares about Notetaker)
- Use "you" language: "This is where you'd see Jordan's scorecard..."
- Ask engagement questions mid-demo: "Does this match what you're experiencing?"
- When showing ATS integration, show the specific ATS this customer uses (Greenhouse, Lever, etc.)
- Reference a proof point naturally, tied to their situation
- Handle objections before moving on, not by tabling them
- End with a specific next step: trial, pricing discussion, intro to CS team—not "let me know if you have questions"
`

export const DISCOVERY_RUBRIC = `
## Discovery Call Grading Rubric (100 points total)

### 1. Opening & Rapport (10 pts)
- 10: Warm, personalized opener referencing previous touchpoint; clear agenda set; permission to explore asked
- 7: Good opener, agenda set but not personalized; or good personalization but no agenda
- 4: Generic opener ("thanks for your time today"); no clear agenda
- 1: Dove straight into pitch; no rapport attempt

### 2. Discovery Questions (25 pts)
- 25: Asked 4+ open-ended, process-focused questions; dug deeper on answers; uncovered real pain with specifics; let the prospect talk >60% of the time
- 18: Asked good questions but didn't dig deeper; or asked too many closed/leading questions; prospect talked 40–60% of the time
- 10: Asked surface-level questions; accepted first answers without probing; AE talked more than prospect
- 3: Mostly pitched the product with a few token questions; monologue-style

### 3. Needs Qualification (20 pts)
- 20: Uncovered pain + impact + timeline + decision process + stakeholders (BANT equivalent); knows who signs the check
- 14: Uncovered pain and impact but missed timeline or decision process
- 8: Uncovered surface pain but not quantified impact; no timeline; no decision process
- 2: No real qualification; just product pitch

### 4. Active Listening (15 pts)
- 15: Reflected back what the prospect said; connected their specific words/pain to product; followed the prospect's thread; never asked a question that was already answered
- 10: Generally listened; some callbacks to what prospect said; occasionally missed a cue
- 5: Appeared to listen but responses didn't connect to what was said; missed clear signals
- 1: Clearly reading from a script; didn't adapt to answers

### 5. Value Teasing (15 pts)
- 15: Introduced MetaView's value in the context of the prospect's specific pain; used a relevant proof point; didn't do a full pitch; left them wanting more
- 10: Introduced value but too product-feature-focused rather than prospect-pain-focused; or relevant proof point but not tailored
- 5: Dropped features without connecting to their pain; or no value introduced at all
- 1: Launched into a full product demo before the prospect agreed to one

### 6. Close / Next Step (15 pts)
- 15: Proposed a specific, concrete next step (e.g., "I'd love to get you a demo—does Thursday at 2pm work?"); got verbal commitment; set expectations for next call
- 10: Proposed a next step but vague ("I'll send you some info"); or got commitment but no specifics
- 5: Ended without a clear next step; ended on "let me know if you have questions"
- 1: Call ended with no next step discussed
`

export const DEMO_RUBRIC = `
## Demo Call Grading Rubric (100 points total)

### 1. Discovery Recap (10 pts)
- 10: Opened by referencing specific pain points from the previous discovery call; confirmed priorities haven't shifted; agenda set
- 7: Referenced discovery pain but generically ("you mentioned challenges with notes"); no confirmation of current priorities
- 4: Brief mention of previous call but jumped straight to demo
- 1: Started the demo without any reference to discovery; treated it like a first call

### 2. Demo Relevance (25 pts)
- 25: Showed only the 2–3 features directly relevant to this prospect's pain; skipped irrelevant modules; used "you" language throughout; asked "does this match what you're seeing?"
- 18: Mostly relevant but feature-dumped on some modules; or relevant but didn't engage prospect during demo
- 10: General product tour; showed features in order, not tailored; could have been given to any prospect
- 3: Showed irrelevant features; ignored what the prospect said their pain was

### 3. MetaView Product Accuracy (20 pts)
- 20: All product claims accurate; knew integrations, pricing, specific ATS behavior; corrected any misconceptions; no invented features
- 14: Mostly accurate with 1 minor error or gap; self-corrected when pushed
- 8: 1–2 factual errors about integrations, pricing, or features; didn't notice when challenged
- 2: Multiple inaccuracies; couldn't answer product questions; bluffed

### 4. Objection Handling (20 pts)
- 20: Anticipated objections; handled with empathy ("That's a fair concern—") + evidence (proof point, specific product behavior, or data); moved forward without dismissing
- 14: Handled objections adequately; empathy present but evidence weak; or evidence strong but empathy missing
- 8: Got defensive or dismissed objections; or agreed too quickly without addressing ("Good point, I'll look into that")
- 2: Stumbled badly on objections; made things up; became visibly uncomfortable

### 5. Proof Points (10 pts)
- 10: Cited at least one specific case study tied to this prospect's situation (Engine: 40 min/day; Riviera: 6–15 hrs/week; Perk: global hiring quality); made it feel relevant to their context
- 7: Cited proof points but not tied to this prospect's specific pain
- 4: Generic social proof ("we have many happy customers") without specifics
- 1: No proof points cited at all

### 6. Close / Next Step (15 pts)
- 15: Proposed a clear, specific next step (trial, proposal, pricing discussion, intro to CSM); set timeline; got verbal commitment; summarized agreed-upon next steps
- 10: Proposed a next step but vague or without timeline
- 5: Ended without a concrete next step; "let me know if you have questions" type ending
- 1: No attempt to close; left prospect to drive the next action
`
