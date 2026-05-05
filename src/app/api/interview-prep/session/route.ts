import { buildStakeholderSystemPrompt, type StakeholderRole, type TargetAccount } from '@/lib/interview-prep'

interface RequestShape {
  account: TargetAccount
  speakingAs: StakeholderRole
}

export async function POST(req: Request) {
  const { account, speakingAs } = await req.json() as RequestShape

  if (!account || !speakingAs) {
    return Response.json({ error: 'account and speakingAs are required' }, { status: 400 })
  }

  const stakeholder = account.stakeholders[speakingAs]
  if (!stakeholder) {
    return Response.json({ error: 'Unknown stakeholder role' }, { status: 400 })
  }

  const instructions = buildStakeholderSystemPrompt({ account, speakingAs })

  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-realtime-preview',
      voice: stakeholder.voice,
      instructions,
      turn_detection: {
        type: 'server_vad',
        create_response: false,
        interrupt_response: false,
      },
      input_audio_transcription: { model: 'gpt-4o-mini-transcribe' },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    return Response.json({ error }, { status: response.status })
  }

  const data = await response.json()
  return Response.json(data)
}
