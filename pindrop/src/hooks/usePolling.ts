import { useEffect, useState, useCallback } from 'react';
import { type Photo, fetchPhotosWithLocation } from '../lib/supabase';

const POLLING_INTERVAL = 30000; // 30 seconds
const MAX_PINS = 500;

// Global refetch trigger - allows external code to trigger an immediate refetch
let refetchListeners: ((fn: () => Promise<void>) => void)[] = [];

export function triggerPhotosRefetch() {
  refetchListeners.forEach((listener) => {
    listener(async () => {
      try {
        const fetchedPhotos = await fetchPhotosWithLocation();
        const limitedPhotos = fetchedPhotos.slice(0, MAX_PINS);
        return limitedPhotos;
      } catch (err) {
        console.error('Failed to refetch photos:', err);
        throw err;
      }
    });
  });
}

export function usePolling() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    try {
      setError(null);
      const fetchedPhotos = await fetchPhotosWithLocation();

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
  }, []);

  useEffect(() => {
    // Register this instance's poll function with global listeners
    const listener = (pollFn: () => Promise<any>) => {
      pollFn().then((newPhotos) => {
        if (newPhotos) setPhotos(newPhotos);
      });
    };
    refetchListeners.push(listener);

    // Fetch immediately on mount
    poll();

    // Then set up polling interval
    const pollInterval = setInterval(poll, POLLING_INTERVAL);

    // Cleanup: clear interval on unmount and remove listener
    return () => {
      clearInterval(pollInterval);
      refetchListeners = refetchListeners.filter((l) => l !== listener);
    };
  }, [poll]);

  return { photos, loading, error };
}
