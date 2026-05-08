import { personas } from '@/lib/personas'
import type { CallType } from '@/lib/personas'

export async function POST(req: Request) {
  const { personaId, callType } = await req.json() as { personaId: string; callType: CallType }

  const persona = personas.find((p) => p.id === personaId)
  if (!persona) {
    return Response.json({ error: 'Persona not found' }, { status: 404 })
  }

  const instructions = persona.systemPrompt(callType)

  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-realtime-preview',
      voice: persona.voice,
      instructions,
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 200,
        silence_duration_ms: 1500,
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
