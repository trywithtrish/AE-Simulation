import OpenAI from 'openai'
import { METAVIEW_KNOWLEDGE } from '@/lib/metaview'
import { METAVIEW_ICP, TARGET_LIST_RUBRIC, type ListGraderResult } from '@/lib/interview-prep'

interface RequestShape {
  companies: { name: string; rationale: string }[]
}

export async function POST(req: Request) {
  const openai = new OpenAI()
  const { companies } = await req.json() as RequestShape

  if (!Array.isArray(companies) || companies.length === 0) {
    return Response.json({ error: 'No companies provided' }, { status: 400 })
  }

  const filled = companies.filter((c) => c.name?.trim())
  if (filled.length === 0) {
    return Response.json({ error: 'At least one company is required' }, { status: 400 })
  }

  const systemPrompt = `You are an elite sales coach evaluating a Metaview AE's target-account list for the SMB segment.

You have full knowledge of Metaview's product and ICP:

${METAVIEW_KNOWLEDGE}

${METAVIEW_ICP}

${TARGET_LIST_RUBRIC}

You are evaluating a list of companies the AE selected as good Metaview prospects. Some companies you may know directly (real, well-known firms); for others you'll need to reason about plausible characteristics. Be honest — if a company is clearly the wrong segment (mega-enterprise, frontline-only hiring, regulated finance with cloud-AI blockers, pre-PMF), score it low even if the rationale sounds confident. If a company you don't recognize sounds plausible, give it the benefit of the doubt but flag the assumption.

Return ONLY valid JSON in this exact shape:
{
  "perCompany": [
    {
      "companyName": "<company name as the AE wrote it>",
      "fitScore": <0-10>,
      "rationaleScore": <0-10>,
      "critique": "<2-3 sentences: is this the right segment? what's strong/weak about the rationale? what would push the score up?>"
    }
  ],
  "overallScore": <0-100>,
  "overallCritique": "<3-4 sentences on the list as a whole: diversity, ICP awareness, any obvious misses or great picks. Specific.>",
  "topPick": "<the company name from the list that is the strongest fit, used as a recommendation for the next exercise>"
}`

  const userContent = `Here is the AE's target list. Grade each company against Metaview's SMB ICP:

${filled.map((c, i) => `${i + 1}. ${c.name}\n   Rationale: ${c.rationale || '(none provided)'}`).join('\n\n')}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const raw = completion.choices[0].message.content ?? '{}'
  const result = JSON.parse(raw) as ListGraderResult
  return Response.json(result)
}
