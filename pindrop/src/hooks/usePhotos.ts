import { useState, useEffect } from 'react'
import type { Photo } from '../types/photo'
import { fetchPhotos } from '../lib/supabase'

interface UsePhotosResult {
  photos: Photo[]
  loading: boolean
  error: string | null
}

const POLL_INTERVAL_MS = 30_000

export function usePhotos(): UsePhotosResult {
  const [photos, setPhotos]   = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const result = await fetchPhotos()
      if (cancelled) return
      if (result.error) {
        setError(result.error)
        setPhotos([])
      } else {
        setPhotos(result.data)
        setError(null)
      }
      setLoading(false)
    }

    load()

    const interval = setInterval(load, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return { photos, loading, error }
}
