import { requireAdmin } from '@/lib/server/admin-auth'
import { decksConfigured } from '@/lib/server/decks'
import { getIntake, listPitches, listRegistrations } from '@/lib/server/store'
import { errorResponse, json } from '@/lib/server/http'

export async function GET() {
  try {
    await requireAdmin()
    const [open, pitches, registrations] = await Promise.all([getIntake(), listPitches(), listRegistrations()])
    return json({ open, uploadsReady: decksConfigured(), pitches: pitches.map(({ deckPath: _path, ...pitch }) => pitch), registrations })
  } catch (error) { return errorResponse(error) }
}
