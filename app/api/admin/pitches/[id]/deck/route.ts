import { requireAdmin } from '@/lib/server/admin-auth'
import { findPitch } from '@/lib/server/store'
import { readDeck } from '@/lib/server/decks'
import { HttpError, errorResponse } from '@/lib/server/http'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const pitch = await findPitch(id)
    if (!pitch) throw new HttpError(404, 'Pitch not found.')
    return new Response(await readDeck(pitch.deckPath), { headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="pitch-${pitch.id.replace(/[^a-z0-9-]/gi, '')}.pdf"`,
      'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': 'sandbox',
    } })
  } catch (error) { return errorResponse(error) }
}
