import 'server-only'
import { serviceClient } from '@/lib/supabase/service'
import { supabaseConfigured } from '@/lib/supabase/config'
import { HttpError } from './http'

export const decksConfigured = supabaseConfigured
export const deckBucket = 'eea-pitch-decks'
const validPath = /^pitches\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/deck\.pdf$/

export async function saveDeck(id: string, bytes: Uint8Array) {
  const path = `pitches/${id}/deck.pdf`
  if (!validPath.test(path)) throw new HttpError(400, 'Invalid pitch reference.')
  const { error } = await serviceClient().storage.from(deckBucket)
    .upload(path, bytes, { contentType: 'application/pdf', upsert: false })
  if (error) throw error
  return path
}

export async function removeDeck(path: string) {
  if (!validPath.test(path)) throw new HttpError(404, 'Deck not found.')
  const { error } = await serviceClient().storage.from(deckBucket).remove([path])
  if (error) throw error
}

export async function readDeck(path: string) {
  if (!validPath.test(path)) throw new HttpError(404, 'Deck not found.')
  const { data, error } = await serviceClient().storage.from(deckBucket).download(path)
  if (error && ['404', '400'].includes(String(error.statusCode))) throw new HttpError(404, 'Deck not found.')
  if (error) throw error
  return data.stream()
}
