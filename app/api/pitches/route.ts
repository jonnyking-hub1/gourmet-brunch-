import { randomUUID } from 'node:crypto'
import { maxDeckBytes, pitchFields, validateDeck, validatePitch } from '@/lib/pitch'
import { getIntake, savePitch } from '@/lib/server/store'
import { decksConfigured, removeDeck, saveDeck } from '@/lib/server/decks'
import { HttpError, errorResponse, json, readBytes, sameOrigin } from '@/lib/server/http'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  let deckPath: string | undefined
  let recordWriteStarted = false
  try {
    sameOrigin(request)
    if (!decksConfigured() || !await getIntake()) throw new HttpError(409, 'Pitch submissions are currently closed. Your details have been kept on this page.')
    const bytes = await readBytes(request, maxDeckBytes + 64 * 1024)
    let form: FormData
    try {
      form = await new Response(new Uint8Array(bytes), { headers: { 'Content-Type': request.headers.get('content-type') || '' } }).formData()
    } catch { throw new HttpError(400, 'Please submit the pitch form with a PDF deck.') }
    // Hidden honeypot is not a participant field.
    if (form.get('website')) throw new HttpError(400, 'Unable to accept this submission.')
    const { values, errors } = validatePitch(Object.fromEntries(Object.keys(pitchFields).map(key => [key, form.get(key) ?? ''])))
    const deck = form.get('deck')
    if (!(deck instanceof File)) errors.deck = 'Attach your pitch deck as a PDF.'
    else {
      const issue = validateDeck(deck.name, deck.size, new Uint8Array(await deck.slice(0, 5).arrayBuffer()))
      if (issue) errors.deck = issue
    }
    if (Object.keys(errors).length) return json({ error: 'Please check the highlighted fields.', errors }, 400)
    const file = deck as File
    const id = randomUUID()
    deckPath = await saveDeck(id, new Uint8Array(await file.arrayBuffer()))
    // Closing intake also stops a submission that was still uploading.
    if (!await getIntake()) throw new HttpError(409, 'Pitch submissions have just closed. Your details have been kept on this page.')
    recordWriteStarted = true
    await savePitch({ ...values, id, submittedAt: new Date().toISOString(), deckPath, deckName: file.name.slice(0, 200), status: 'New', notes: '', reviewedAt: '' })
    return json({ success: true, id }, 201)
  } catch (error) {
    // A closed-intake rejection guarantees no row was inserted. An uncertain
    // database response may follow a commit, so retain the private deck then.
    if (deckPath && (!recordWriteStarted || (error instanceof HttpError && error.status === 409))) {
      try { await removeDeck(deckPath) } catch { console.error('Unable to clean up an unlinked pitch deck.') }
    }
    return errorResponse(error)
  }
}
