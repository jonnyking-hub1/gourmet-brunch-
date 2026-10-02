import { requireAdmin } from '@/lib/server/admin-auth'
import { decksConfigured } from '@/lib/server/decks'
import { setIntake } from '@/lib/server/store'
import { HttpError, errorResponse, json, readJson, sameOrigin } from '@/lib/server/http'

export async function POST(request: Request) {
  try {
    await requireAdmin()
    sameOrigin(request)
    const body = await readJson(request) as { open?: unknown } | null
    if (typeof body?.open !== 'boolean') throw new HttpError(400, 'Choose whether to open or close submissions.')
    if (body.open && !decksConfigured()) throw new HttpError(503, 'Connect private pitch storage before opening submissions.')
    await setIntake(body.open)
    return json({ open: body.open })
  } catch (error) { return errorResponse(error) }
}
