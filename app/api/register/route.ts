import { validateRegistration } from '@/lib/registration'
import { saveRegistration } from '@/lib/server/store'
import { errorResponse, json, readJson, sameOrigin } from '@/lib/server/http'

export async function POST(request: Request) {
  try {
    sameOrigin(request)
    const { values, errors } = validateRegistration(await readJson(request))
    if (Object.keys(errors).length) return json({ error: Object.values(errors)[0], errors }, 400)
    await saveRegistration(values)
    return json({ success: true })
  } catch (error) { return errorResponse(error) }
}
