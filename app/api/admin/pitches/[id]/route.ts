import { requireAdmin } from '@/lib/server/admin-auth'
import { updateReview } from '@/lib/server/store'
import { reviewStatuses, type ReviewStatus } from '@/lib/pitch'
import { HttpError, errorResponse, json, readJson, sameOrigin } from '@/lib/server/http'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    sameOrigin(request)
    const { id } = await params
    const body = await readJson(request) as { status?: unknown; notes?: unknown } | null
    if (!body || !reviewStatuses.includes(body.status as ReviewStatus) || typeof body.notes !== 'string' || body.notes.length > 5000) {
      throw new HttpError(400, 'Choose a review status and keep notes under 5,000 characters.')
    }
    return json(await updateReview(id, body.status as ReviewStatus, body.notes))
  } catch (error) { return errorResponse(error) }
}
