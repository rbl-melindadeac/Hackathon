import { createClient } from '@supabase/supabase-js'
import type { Photo } from '../types/photo'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl)      console.error('[supabase] Missing VITE_SUPABASE_URL')
if (!supabaseAnonKey)  console.error('[supabase] Missing VITE_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapRow(row: Record<string, unknown>): Photo {
  return {
    id:               row.id as string,
    fileUrl:          row.file_url as string,
    lat:              row.lat as number | null,
    lng:              row.lng as number | null,
    isManuallyPinned: row.is_manually_pinned as boolean,
    createdAt:        row.created_at as string,
  }
}

// ── Upload + insert ───────────────────────────────────────────────────────────

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

export async function uploadPhoto(
  file: File,
  lat: number | null,
  lng: number | null,
): Promise<{ data: Photo; error: null } | { data: null; error: string }> {
  if (file.size > MAX_FILE_BYTES)
    return { data: null, error: 'File exceeds 10 MB limit.' }

  const path = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(path, file)

  if (uploadError)
    return { data: null, error: `Upload failed: ${uploadError.message}` }

  const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
  const fileUrl = urlData.publicUrl

  const { data: rows, error: insertError } = await supabase
    .from('photos')
    .insert({ file_url: fileUrl, lat, lng })
    .select()

  if (insertError || !rows?.length)
    return { data: null, error: `Database insert failed: ${insertError?.message ?? 'no row returned'}` }

  return { data: mapRow(rows[0]), error: null }
}

// ── Fetch pinned photos (map) ─────────────────────────────────────────────────

export async function fetchPhotos(): Promise<{ data: Photo[]; error: null } | { data: null; error: string }> {
  const { data: rows, error } = await supabase
    .from('photos')
    .select('*')
    .not('lat', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return { data: null, error: error.message }
  return { data: (rows ?? []).map(mapRow), error: null }
}

// ── Fetch unlocated photos ────────────────────────────────────────────────────

export async function fetchUnlocatedPhotos(): Promise<{ data: Photo[]; error: null } | { data: null; error: string }> {
  const { data: rows, error } = await supabase
    .from('photos')
    .select('*')
    .is('lat', null)

  if (error) return { data: null, error: error.message }
  return { data: (rows ?? []).map(mapRow), error: null }
}

// ── Manual coordinate assignment ──────────────────────────────────────────────

export async function updatePhotoCoordinates(
  id: string,
  lat: number,
  lng: number,
): Promise<{ data: Photo; error: null } | { data: null; error: string }> {
  if (lat === 0 && lng === 0)
    return { data: null, error: 'Coordinates 0,0 are not valid — use null for unlocated.' }

  const { data: rows, error } = await supabase
    .from('photos')
    .update({ lat, lng, is_manually_pinned: true })
    .eq('id', id)
    .select()

  if (error || !rows?.length)
    return { data: null, error: `Update failed: ${error?.message ?? 'no row returned'}` }

  return { data: mapRow(rows[0]), error: null }
}
