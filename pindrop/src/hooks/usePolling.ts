import { useEffect, useState } from 'react';
import { type Photo, fetchPhotos } from '../lib/supabase';

const POLLING_INTERVAL = 30000; // 30 seconds
const MAX_PINS = 500;

export function usePolling() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let pollInterval: number | null = null;

    async function poll() {
      try {
        setError(null);
        const fetchedPhotos = await fetchPhotos();

        // Enforce 500-pin limit with FIFO replacement
        // Keep only the most recently uploaded photos
        const limitedPhotos = fetchedPhotos.slice(0, MAX_PINS);
        setPhotos(limitedPhotos);
        setLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch photos';
        setError(message);
        setLoading(false);
      }
    }

    // Fetch immediately on mount
    poll();

    // Then set up polling interval
    pollInterval = setInterval(poll, POLLING_INTERVAL);

    // Cleanup: clear interval on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

  return { photos, loading, error };
}
