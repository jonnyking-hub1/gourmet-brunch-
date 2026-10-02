import 'server-only'
import { NextResponse } from 'next/server'

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status)
  console.error('EEA request failed:', error instanceof Error ? error.name : 'UnknownError')
  return json({ error: 'We could not complete this request. Please try again.' }, 503)
}

export function sameOrigin(request: Request) {
  const url = new URL(request.url)
  // Next may reconstruct request.url with its internal hostname. Host retains
  // the site's address seen by the browser; APP_ORIGIN can pin a proxy's origin.
  const host = request.headers.get('host')
  if (host) url.host = host
  const expected = process.env.APP_ORIGIN || url.origin
  if (request.headers.get('origin') !== expected) throw new HttpError(403, 'Please use the form on this website.')
}

export async function readBytes(request: Request, limit: number) {
  if (Number(request.headers.get('content-length')) > limit) throw new HttpError(413, 'This submission is too large.')
  if (!request.body) throw new HttpError(400, 'A request body is required.')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const result = await reader.read()
      if (result.done) break
      size += result.value.length
      if (size > limit) { await reader.cancel(); throw new HttpError(413, 'This submission is too large.') }
      chunks.push(result.value)
    }
  } finally { reader.releaseLock() }
  return Buffer.concat(chunks, size)
}

export async function readJson(request: Request, limit = 16_384) {
  const data = await readBytes(request, limit)
  try { return JSON.parse(data.toString('utf8')) as unknown }
  catch { throw new HttpError(400, 'Invalid request body.') }
}
