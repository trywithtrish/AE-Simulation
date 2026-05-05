export interface ProductQuestion {
  id: string
  topic: string
  prompts: string[]
  keyPoints: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface ObjectionScenario {
  id: string
  objection: string
  scenarios: string[]
  keyPoints: string[]
}

export const PRODUCT_QUESTIONS: ProductQuestion[] = [
  {
    id: 'four-modules',
    topic: 'Product overview',
    difficulty: 'easy',
    prompts: [
      'What are the four modules that make up the Metaview platform?',
      'A prospect says they\'ve only heard Metaview described as "an AI notetaker." How would you give them a more complete picture of what the platform does?',
      'You\'re on a call and the prospect asks: "So what actually is Metaview?" Give your best one-minute product overview.',
    ],
    keyPoints: [
      'Four modules: Notetaker, Reports, Job Posts, Candidate Search (AI Sourcing)',
      'Companies can start with one module and expand',
      'It is NOT a general-purpose meeting recorder — trained specifically on hiring conversations',
    ],
  },
  {
    id: 'notes-structure',
    topic: 'Notetaker — key differentiator',
    difficulty: 'medium',
    prompts: [
      'What\'s the fundamental difference between how Metaview structures interview notes compared to tools like Otter.ai or Zoom\'s built-in AI summary?',
      'A prospect says: "We already get a transcript from Zoom after every interview. What does Metaview give us that we don\'t already have?" How do you respond?',
      'Why does organizing interview notes by question instead of by timestamp matter? Explain the practical difference for a hiring team.',
    ],
    keyPoints: [
      'Metaview organizes notes by QUESTION ASKED, not by timestamp',
      'This is the key differentiator from Otter.ai, Fireflies, Zoom AI Summary',
      'Notes capture: salary expectations, technical competency signals, culture fit signals, red flags — organized per question',
      'Competing tools give a raw timestamped transcript; Metaview gives structured scorecard notes',
      'The AI is trained specifically on hiring conversations, not general meetings',
    ],
  },
  {
    id: 'greenhouse-integration',
    topic: 'ATS integration — Greenhouse specifics',
    difficulty: 'hard',
    prompts: [
      'Walk me through exactly what happens in Greenhouse after a Metaview-recorded interview ends. Be specific about what the interviewer sees and what they have to do.',
      'A Greenhouse user asks: "Does Metaview just attach a PDF or summary to the candidate record?" What\'s the accurate, specific answer?',
      'What is the critical difference between how Metaview integrates with Greenhouse versus how a tool like Otter.ai would?',
    ],
    keyPoints: [
      'Notes push DIRECTLY into Greenhouse scorecard fields — NOT as a PDF attachment or separate document',
      'Interviewers can review Metaview\'s AI draft and edit before submitting — they don\'t have to start from scratch',
      'Metaview does NOT auto-submit — the hiring manager still reviews and submits',
      'Works with existing Greenhouse scorecard templates including custom fields',
      'This is why adoption is higher — it reduces work rather than adding steps',
    ],
  },
  {
    id: 'pricing-tiers',
    topic: 'Pricing',
    difficulty: 'easy',
    prompts: [
      'What are Metaview\'s three pricing tiers and what does each include at a high level?',
      'A 90-person Series B startup asks you about pricing. Walk them through their options.',
      'When is the Enterprise plan the right recommendation versus Pro?',
    ],
    keyPoints: [
      'Free tier: 5 interviews — good for pilots, no commitment',
      'Pro: $50/month per user',
      'Enterprise: custom pricing — for teams doing 100+ interviews/month, or needing compliance features (SSO, advanced governance, dedicated CSM)',
      'Pro is right for most SMB teams; Enterprise when scale or compliance requirements kick in',
    ],
  },
  {
    id: 'licensing-model',
    topic: 'Pricing — who pays for a seat',
    difficulty: 'hard',
    prompts: [
      'A prospect with 4 recruiters and 60 hiring managers asks: "Do all 64 people who touch interviews need a license?" What\'s the accurate answer and why does this matter?',
      'What\'s the most common mistake AEs make when explaining Metaview\'s pricing to a customer, and what\'s the correct framing?',
      'How should you explain who needs a Metaview seat when a customer pushes back on per-seat pricing?',
    ],
    keyPoints: [
      'Licenses are for RECRUITERS/COORDINATORS who manage the process — NOT every hiring manager',
      'A team with 5 recruiters and 50 hiring managers would buy 5 seats, not 55',
      'Hiring managers interact with Metaview\'s output (reviewing/editing AI notes) but don\'t need their own license',
      'This is a critical distinction — quoting per-hiring-manager inflates price and kills deals unnecessarily',
    ],
  },
  {
    id: 'ats-notes-integrations',
    topic: 'Integrations — notes push',
    difficulty: 'medium',
    prompts: [
      'Which ATS platforms does Metaview\'s Notetaker (notes push) integrate with? List them all.',
      'A prospect is on Workday for their ATS. Does Metaview support them for the Notetaker integration?',
      'What\'s the difference between which ATSes support Metaview\'s notes push vs. which support AI Sourcing (Candidate Search)?',
    ],
    keyPoints: [
      'Notes push: Greenhouse, Lever, Ashby, Gem, SmartRecruiters, Workday, Bullhorn',
      'AI Sourcing (Candidate Search): Ashby, Bullhorn, Ezekia, Greenhouse, Gem, Loxo, SmartRecruiters',
      'Key distinctions: Workday is on notes push but NOT AI Sourcing. Loxo and Ezekia are AI Sourcing only.',
      'Video platforms: Zoom, Google Meet, Microsoft Teams',
      'Calendars: Google Calendar, Outlook',
    ],
  },
  {
    id: 'setup-time',
    topic: 'Setup and onboarding',
    difficulty: 'easy',
    prompts: [
      'A prospect is worried about implementation complexity. What\'s the actual setup time for Metaview\'s Notetaker, and how does it know which interviews to join?',
      'How would you handle a prospect who says "we don\'t have bandwidth for a big implementation right now"?',
      'Walk me through the onboarding experience for a new Metaview customer from zero to first interview recorded.',
    ],
    keyPoints: [
      'Setup time: under 45 seconds to get running',
      'Metaview connects to your calendar and auto-joins all interviews matching criteria you set',
      'No complex implementation — this is a key counter to "we don\'t have bandwidth" objections',
      'Pilot starting point: Free tier covers 5 interviews to test before any commitment',
    ],
  },
  {
    id: 'proof-points',
    topic: 'Customer proof points',
    difficulty: 'medium',
    prompts: [
      'Name at least two specific customer proof points and the exact results they achieved with Metaview.',
      'A skeptical recruiter asks: "Can you give me real numbers on what teams actually save?" What do you tell them?',
      'You\'re talking to a Director of Talent at a 250-person company who runs about 100 interviews a month. What\'s the most relevant proof point to cite and why?',
    ],
    keyPoints: [
      'Engine: ~40 minutes saved per recruiter per day (previously spent writing screening notes and submitting scorecards)',
      'Riviera Partners (80-person recruiting firm): 6+ hours saved per recruiter per week on average; some saved up to 15 hours',
      'Perk: enabled high-quality global hiring at scale — recruiters could focus on candidates instead of notes',
      'General benchmark: 3–5 hours saved per recruiter per week',
      'Best proof point depends on the prospect — match company size and use case',
    ],
  },
  {
    id: 'reports-module',
    topic: 'Reports module',
    difficulty: 'medium',
    prompts: [
      'A VP of People asks what Metaview can tell them about how their interviewers are actually performing. What does the Reports module specifically show?',
      'What is Metaview\'s AI Governance feature and why does it matter?',
      'A talent director is worried about bias in their hiring process. Which Metaview features are most relevant to that concern?',
    ],
    keyPoints: [
      'Interviewer-level performance data: who asks good questions, consistency, talk/listen ratios',
      'Per-interview summaries available minutes after the call',
      'Candidate comparison across finalists (e.g. "What did all three finalists say about remote work?")',
      'Trend reports: which roles take longest, where candidates drop off in funnel',
      'AI Governance: teams define rules for what AI can/can\'t flag; audit trail of AI reasoning',
      'Alerts for non-compliant interview behavior (e.g. illegal questions asked)',
    ],
  },
  {
    id: 'candidate-search',
    topic: 'Candidate Search / AI Sourcing',
    difficulty: 'medium',
    prompts: [
      'A Head of Talent on Greenhouse says they spend too much time sourcing and they have a large ATS database they barely use. What Metaview module should you highlight and what does it do?',
      'What is the Candidate Search module and who is it most relevant for?',
      'A prospect asks: "We use Workday as our ATS — does the AI Sourcing feature work for us?" What\'s the accurate answer?',
    ],
    keyPoints: [
      'Candidate Search / AI Sourcing: rediscovers and re-engages existing talent in the ATS database',
      'AI surfaces candidates from existing ATS who may fit new open roles — reduces outbound sourcing time',
      'Available for: Ashby, Bullhorn, Ezekia, Greenhouse, Gem, Loxo, SmartRecruiters',
      'NOT available for Workday — this is a common trap question',
      'Most relevant for high-volume recruiting teams with large existing talent databases',
    ],
  },
  {
    id: 'candidate-consent',
    topic: 'Candidate recording consent',
    difficulty: 'easy',
    prompts: [
      'How does Metaview handle candidate notification and consent for recording?',
      'What happens if a candidate on a call doesn\'t want to be recorded?',
      'A prospect asks: "Do candidates know they\'re being recorded and do they have a choice?" What\'s your answer?',
    ],
    keyPoints: [
      'Candidates see a notification/banner at the start of the call — they know they\'re being recorded',
      'If a candidate declines, you can turn off recording for that session',
      'Recording consent is now standard in modern recruiting — most candidates are comfortable with it',
      'This is not a hidden or passive recording — transparency is built in',
    ],
  },
  {
    id: 'competitors',
    topic: 'Competitive landscape',
    difficulty: 'hard',
    prompts: [
      'A prospect is also evaluating BrightHire. How do you position Metaview against them?',
      'Your prospect says they use Gem for recruiting. Is Gem a competitor to Metaview? How do you explain the difference?',
      'What\'s the core reason Otter.ai or Fireflies isn\'t a real substitute for Metaview, even if they capture audio and produce transcripts?',
    ],
    keyPoints: [
      'BrightHire: direct interview intelligence competitor, more enterprise-focused, higher price point — Metaview wins on SMB fit and price',
      'Gem: ATS/CRM that added some AI features — not a dedicated interview intelligence tool. Different category.',
      'Otter.ai/Fireflies: general transcription, NOT hiring-specific. No ATS integration. No understanding of competency frameworks. Output is raw transcript, not structured scorecard notes.',
      'Sherlock AI: newer entrant, smaller customer base',
      'Metaview\'s key differentiators: hiring-specific AI, organized by question not time, ATS-native notes push, interviewer analytics (unique in market)',
    ],
  },
  {
    id: 'data-security',
    topic: 'Data and security',
    difficulty: 'medium',
    prompts: [
      'A healthcare SaaS company asks about HIPAA compliance and whether Metaview can sign a BAA. What\'s your answer?',
      'A prospect\'s IT team wants to know where Metaview stores data and what the security story is. Walk them through it.',
      'A prospect asks: "Is our interview data used to train Metaview\'s AI models?" What do you tell them?',
    ],
    keyPoints: [
      'Data stored in the US on AWS, encrypted at rest and in transit',
      'Enterprise plans: data retention controls, GDPR compliance, audit trails',
      'Metaview CAN sign a BAA for healthcare companies — this is important to know',
      'Data is NOT used to train AI models — critical point for privacy-conscious companies',
      'SSO is supported',
    ],
  },
  {
    id: 'job-posts-module',
    topic: 'Job Posts module',
    difficulty: 'medium',
    prompts: [
      'A head of talent says their recruiters spend too much time writing job descriptions and the quality is inconsistent across roles. What Metaview feature is relevant?',
      'Describe what the Job Posts module does and how it gets smarter over time.',
      'How does the Job Posts module connect back to actual hiring outcomes?',
    ],
    keyPoints: [
      'Job Posts: AI-generated job descriptions based on your role requirements',
      'Metaview builds an Ideal Candidate Profile (ICP) from the job description',
      'The ICP continuously improves based on hiring decisions — who got offers, who got hired, exit feedback',
      'Factors in team-level preferences and role-specific criteria',
      'Reduces time writing JDs AND improves consistency and quality across the team',
    ],
  },
]

export const OBJECTION_SCENARIOS: ObjectionScenario[] = [
  {
    id: 'recording-consent',
    objection: 'Candidates won\'t want to be recorded',
    scenarios: [
      'The VP of People leans forward: "My biggest worry is candidate experience. We\'ve worked hard on our employer brand and I don\'t want the first thing a candidate sees to be a recording notification. What do candidates actually think about this?"',
      'Mid-call, the Head of Talent interrupts: "Hold on — we interview some pretty senior candidates, ex-FAANG people who are going to hate being recorded. This could tank our offer acceptance rate even further."',
      'The prospect says: "We\'re in a competitive market for talent. If candidates find out we\'re recording them without fully understanding it, we could get burned on Glassdoor. How do you handle that?"',
      'A Talent Lead at a consumer brand says: "Our candidates are pretty savvy. The moment they see a recording bot in the call, some of them are going to drop off. How do other companies handle this?"',
    ],
    keyPoints: [
      'Acknowledge the concern — candidate experience is legitimate and important',
      'Clarify: Metaview is transparent, not hidden. Candidates see a notification/banner at the start of the call.',
      'If a candidate declines, recording can be turned off for that session — it\'s not forced',
      'Recording consent is now standard in modern recruiting — interviewees expect it in tech hiring',
      'Reframe: distracted interviewers (note-taking) actually hurt candidate experience more than transparent recording does',
    ],
  },
  {
    id: 'already-use-otter',
    objection: 'We already use Otter.ai / Zoom transcription',
    scenarios: [
      'The recruiter says: "We actually already use Otter.ai for all our calls — interviews included. I export the transcript after and highlight the relevant parts. I\'m not sure what we\'d be getting that we don\'t have."',
      'The head of talent says: "Zoom already gives us AI meeting notes and a transcript. My team uses that. What\'s the difference?"',
      'A talent lead says: "We tried Fireflies for a while. It was fine. Why is Metaview different — isn\'t it basically the same thing?"',
    ],
    keyPoints: [
      'Acknowledge: Otter/Fireflies/Zoom AI are great general transcription tools',
      'Key distinction: they give you a TRANSCRIPT. Metaview gives you STRUCTURED SCORECARD NOTES organized by question — completely different output',
      'Otter doesn\'t understand hiring context — it can\'t tell a salary expectation from small talk. Metaview\'s AI is trained specifically on hiring conversations.',
      'Critical gap: Otter doesn\'t push into your ATS. Someone still has to take the transcript and manually fill in the scorecard. Metaview closes that gap.',
      'The recruiter "highlighting relevant parts" is the manual work Metaview eliminates.',
    ],
  },
  {
    id: 'ats-notes-field',
    objection: 'Our ATS already has a notes field',
    scenarios: [
      'A hiring manager says: "Look, Greenhouse already has a notes section. My recruiters and interviewers can just type in there. Why would I pay for something to do that?"',
      'The VP of People says: "We have Lever and it has structured scorecards with feedback fields. I\'ve been pushing interviewers to use them. What would Metaview add on top of that?"',
      'A talent ops person says: "We built out a really thorough interview kit in our ATS with specific rating fields. It\'s all there — people just aren\'t filling it in. So it\'s a behavior problem, not a tools problem."',
    ],
    keyPoints: [
      'Acknowledge: yes, the ATS has notes/scorecard fields. That\'s true.',
      'Core reframe: the problem isn\'t the absence of a notes field — it\'s that nobody fills it in reliably. That\'s a behavior problem with a structural cause.',
      'Metaview fixes the structural cause: interviewers don\'t have to start from scratch. The AI creates a first draft from the interview. They just review and submit.',
      'When something saves time instead of adding steps, adoption looks completely different. That\'s the pattern across Metaview customers.',
      'If it was a "behavior problem," pushing harder on scorecards would have solved it already. It hasn\'t.',
    ],
  },
  {
    id: 'adoption-failure',
    objection: 'We tried something like this before and nobody used it',
    scenarios: [
      'The Director of Talent says: "I\'m going to stop you there. Two years ago we bought an interview intelligence platform — I won\'t name it — and after 6 months, two people were using it. I had to go to the CFO and explain why we spent $40K on something with zero adoption. I\'m not doing that again."',
      'The Head of Talent says: "My experience with these tools is that they\'re great demos and terrible rollouts. The product looks impressive but then you go live and your hiring managers just don\'t change behavior."',
      'A VP People says: "We actually piloted something similar last year. Recruiters loved it, hiring managers hated it. The tool added steps for the people who were already most resistant to process. We shut it down after Q1."',
    ],
    keyPoints: [
      'Do NOT get defensive or dismiss the concern — this is the most emotionally loaded objection',
      'Acknowledge directly: "That experience sounds genuinely awful. I completely understand why you\'d be skeptical."',
      'Ask a diagnostic question before responding: "What did rollout look like? Where did adoption break down?" — listen before explaining',
      'Core counter: the reason those tools failed is they added steps for hiring managers. Metaview does the opposite — HMs don\'t take notes at all. They just review the AI draft and click submit. Less work, not more.',
      'Proof: Engine (40 min/day saved), Riviera (6-15 hours/week per recruiter). Adoption is high because it saves time.',
      'Offer a low-risk pilot: Free tier covers 5 interviews — they can test adoption before committing a dollar.',
    ],
  },
  {
    id: 'too-small',
    objection: 'We\'re too small / not doing enough interviews',
    scenarios: [
      'The solo recruiter says: "We\'re a 55-person company and I only run maybe 15 interviews a week. Is this really built for a team our size or is it more of an enterprise product?"',
      'The talent lead says: "I appreciate the pitch but we\'re Series A. We have one recruiter — me. We\'re not exactly an enterprise customer and I feel like we\'d be paying for things we\'d never use."',
      'A founder-led company\'s HR generalist says: "We\'re small enough that our CEO still does some interviews. The process is pretty informal. I\'m not sure a tool like this makes sense until we\'re bigger."',
    ],
    keyPoints: [
      'Reframe: being small means each interview matters MORE, not less — you can\'t afford to lose candidates to a bad experience or miss hiring signals',
      'Free tier: 5 interviews with no commitment or credit card — there\'s no risk to starting',
      'Pro at $50/user/month for one recruiter = the cost of 30 minutes of their time. The ROI math is clear even at small scale.',
      'The 3-5 hours/week saved per recruiter — at small companies that\'s a proportionally bigger impact because the recruiter is wearing many hats',
      'Reference a small-team customer if relevant (Samira at Bloom = 85-person company)',
    ],
  },
  {
    id: 'hipaa-compliance',
    objection: 'HIPAA / data privacy compliance concerns',
    scenarios: [
      'The Head of Talent at a healthcare tech company says: "We\'re HIPAA covered. Any tool that records or processes anything related to our employees or candidates needs a BAA before we can even discuss it further. Can Metaview do that?"',
      'The VP People says: "Our legal team is very particular about data residency. Where does Metaview store interview data and who can access it?"',
      'An enterprise prospect says: "We have a strict vendor security review. Before we go any further — where is the data stored, how long is it retained, and is it used to train any AI models? I need real answers, not marketing."',
    ],
    keyPoints: [
      'Yes, Metaview CAN sign a BAA for healthcare companies — say this clearly',
      'Data stored in the US on AWS, encrypted at rest and in transit',
      'Enterprise plans: data retention controls, GDPR compliance, audit trails',
      'Data is NOT used to train AI models — this is critical and often the first question',
      'SSO is supported',
      'Don\'t hedge or guess — be specific. If you don\'t know a detail, say so and commit to following up with a specific answer.',
    ],
  },
  {
    id: 'roi-budget',
    objection: 'Hard to justify the cost / ROI unclear',
    scenarios: [
      'The VP People says: "I like the concept but $50/user/month is hard to justify to finance without a really clear business case. We have 6 recruiters — that\'s $3,600 a year. What\'s the ROI story I bring to my CFO?"',
      'A head of talent says: "I\'m already over budget this year. My CFO is going to ask me what metric gets better and by how much. What do I tell them?"',
      'The prospect says: "We\'re getting ready for a budget cycle. I need to be able to show a clear return or this doesn\'t get approved. Generic time savings isn\'t going to cut it."',
    ],
    keyPoints: [
      'Anchor on the recruiter time math: 3-5 hours/week per recruiter saved. At average recruiter cost of $70-80k/year, that\'s meaningful dollar value.',
      'Engine proof point: 40 min/day × 5 days × 50 weeks = over 160 hours/recruiter/year recaptured',
      'Riviera: up to 15 hours/week per recruiter saved — for some teams it\'s transformative',
      'Harder-to-quantify ROI: faster time-to-hire, better candidate experience, fewer misses from poor interview notes',
      'Start with Free tier to build internal data before committing — then the ROI case writes itself',
      'Frame as: the cost of one Metaview seat is the cost of about 30 min of a recruiter\'s time per month. The break-even is nearly immediate.',
    ],
  },
  {
    id: 'hm-adoption',
    objection: 'Hiring managers won\'t adopt another tool',
    scenarios: [
      'The VP People sighs: "My hiring managers already hate Greenhouse. I had to beg them to fill out scorecards and half of them still don\'t. If I introduce anything else that touches their interview workflow, I\'m going to have a revolt."',
      'The Head of Talent says: "The challenge isn\'t on the recruiting side — my team will use anything. It\'s the hiring managers. They\'re engineers and PMs and they have zero patience for recruiter tools. What does their experience actually look like?"',
      'A talent lead says: "I can\'t mandate anything to hiring managers — they have more political capital than I do. The tool has to be so obviously easy that they use it without being pushed. Is that realistic here?"',
    ],
    keyPoints: [
      'Key insight: Metaview reduces the hiring manager\'s work, it doesn\'t add to it. They don\'t have to take notes. The AI does it.',
      'HM\'s experience: they get an email/notification after the interview with the AI-generated scorecard draft. They review it, edit if needed, click submit. That\'s it.',
      'Compare to current state: they have to write notes from scratch (or skip entirely). Metaview replaces blank-page anxiety with a review-and-edit flow.',
      'Adoption pattern: when something saves time instead of adding steps, you don\'t need to mandate it. People use it because it helps them.',
      'Reference the adoption narrative from Engine/Riviera — the ROI story is real because the behavior change is real',
    ],
  },
  {
    id: 'it-security-review',
    objection: 'Need IT/security approval first',
    scenarios: [
      'The talent director says: "This sounds promising but anything that processes our interview recordings has to go through our InfoSec team first. That review can take 2-3 months. I\'m not sure if you\'re willing to wait that long."',
      'The prospect says: "I\'m personally interested but I can\'t move forward without an IT security review. That\'s not negotiable. Do you have documentation we can use to kick that off?"',
      'A Head of Talent at a fintech says: "Our security team is notoriously slow on vendor reviews, especially anything that touches recorded content. I\'d be excited about this but I\'m worried about the timeline."',
    ],
    keyPoints: [
      'Do NOT push back against the IT review — validate it. "That\'s completely reasonable, especially for anything that touches interview recordings."',
      'Offer to help accelerate: Metaview has security documentation, SOC 2 details, data residency information ready for IT teams',
      'Offer a parallel track: run a small Free tier pilot (5 interviews) during the review period so the team gains experience while IT does their work',
      'Share the key security facts proactively: US-based AWS storage, encrypted at rest and in transit, no AI model training on their data, BAA available if relevant',
      'Set clear next steps: offer to connect their IT team directly with Metaview\'s security team to expedite',
    ],
  },
  {
    id: 'vs-brighthire',
    objection: 'How is this different from BrightHire?',
    scenarios: [
      'The VP People says: "We\'ve actually already talked to BrightHire. They\'re well-known in this space. What\'s the honest difference between you two and why should we go with Metaview?"',
      'The prospect says: "I\'ve been researching interview intelligence tools and BrightHire kept coming up. I didn\'t realize Metaview was in the same category. Help me understand how to think about the choice."',
      'A talent director says: "BrightHire came in last quarter with a big enterprise pitch and a big price tag. We passed because of cost. Is Metaview in the same price range?"',
    ],
    keyPoints: [
      'Acknowledge BrightHire as a real competitor — don\'t dismiss them',
      'BrightHire positions more enterprise, higher price point — Metaview wins on SMB fit and price',
      'Metaview\'s differentiation: hiring-specific AI trained more deeply on interviewing, not just recording. Interviewer analytics (unique in the market). More ATS-native integration approach.',
      'Price: Metaview Pro at $50/user/month vs. BrightHire which is typically significantly higher for comparable features',
      'Don\'t trash competitors — "they\'re a solid product but built for a different segment at a different price point"',
      'Offer to run a comparison or help them evaluate both if they\'re genuinely deciding between the two',
    ],
  },
  {
    id: 'just-train-interviewers',
    objection: 'Can\'t we just train our interviewers to take better notes?',
    scenarios: [
      'The VP People says: "I\'m wondering if this is really a tools problem or a training problem. What if I just ran a workshop on interview best practices and note-taking? Wouldn\'t that solve it without spending money on software?"',
      'A head of talent says: "We\'ve been talking about rolling out interviewer training for a year. If we did that properly, would we even need something like Metaview?"',
      'The prospect says: "My instinct is that the root problem is discipline, not tools. Hiring managers who are engaged just take good notes naturally. Isn\'t fixing the behavior more important than layering on software?"',
    ],
    keyPoints: [
      'Acknowledge the instinct — training IS valuable and Metaview doesn\'t replace it',
      'But surface the structural problem: even trained interviewers can\'t simultaneously build rapport AND take comprehensive notes. It\'s cognitively impossible to do both well in a live interview.',
      'The goal of training is good judgment and good questions — let Metaview handle the documentation so interviewers can focus on actually listening',
      'Training helps with quality. Metaview helps with consistency and capture. They\'re complementary.',
      'Evidence: teams with good interviewers who USE Metaview get better notes than good interviewers who don\'t — because they\'re not distracted',
      'Ask: "Has the training approach moved the needle on scorecard completion yet?" — usually the answer is no',
    ],
  },
  {
    id: 'ai-dependency',
    objection: 'I don\'t want to be too dependent on AI for important hiring decisions',
    scenarios: [
      'The VP People says: "I\'m a little wary of AI being in the loop on hiring decisions. These are consequential choices about people\'s careers. How confident should I be that the AI isn\'t introducing bias or missing important signals?"',
      'The Head of Talent says: "My concern is that if AI generates the notes, interviewers stop thinking critically and just rubber-stamp what it produces. That seems like a real risk."',
      'A talent director says: "We\'ve had some bad experiences with AI tools that hallucinated or confidently said wrong things. How does Metaview handle accuracy, and what happens when it gets something wrong?"',
    ],
    keyPoints: [
      'Acknowledge the concern — it\'s legitimate and thoughtful',
      'Clarify what the AI actually does: it produces a DRAFT. The interviewer reviews, edits, and submits. The human judgment is preserved — the AI handles the tedious capture, not the decision.',
      'Reframe the bias risk: the bigger bias risk is inconsistent note-taking by humans. Some interviewers are thorough, others write nothing. AI produces consistent, structured capture for every interview.',
      'AI Governance module: teams can define rules for what the AI can and can\'t flag. Audit trail of AI reasoning. Built for compliance-conscious teams.',
      'On hallucination: Metaview is trained on hiring conversations specifically. It captures what was said — it doesn\'t infer or synthesize beyond the transcript.',
      'The human always has final say before anything is submitted to the ATS.',
    ],
  },
]

export function pickRandom<T>(arr: T[], excluding?: T): T {
  if (arr.length === 1) return arr[0]
  const pool = excluding !== undefined ? arr.filter((x) => x !== excluding) : arr
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getRandomPrompt(question: ProductQuestion): string {
  return pickRandom(question.prompts)
}

export function getRandomScenario(objection: ObjectionScenario): string {
  return pickRandom(objection.scenarios)
}
