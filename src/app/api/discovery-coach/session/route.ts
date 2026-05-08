import { DISCOVERY_COACH_PERSONA, generateRileyVariant, generateDiscoveryCoachPrompt } from '@/lib/discovery-coach'

export async function POST() {
  const variant = generateRileyVariant()
  const instructions = generateDiscoveryCoachPrompt(variant)

  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-realtime-preview',
      voice: DISCOVERY_COACH_PERSONA.voice,
      instructions,
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 1500,
      },
      input_audio_transcription: { model: 'gpt-4o-mini-transcribe', language: 'en' },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    return Response.json({ error }, { status: response.status })
  }

  const data = await response.json()
  return Response.json({ ...data, rileyVariant: variant })
}
