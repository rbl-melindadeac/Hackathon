import { useState, useEffect } from 'react';

export interface UnlocatedPhoto {
  id: string;
  file: File;
  title: string;
  error?: string;
}

const STORAGE_KEY = 'pindrop_unlocated_photos';

export function useUnlocatedPhotos() {
  const [photos, setPhotos] = useState<UnlocatedPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out File objects (can't be serialized), keep metadata
        setPhotos(
          parsed.map((p: any) => ({
            id: p.id,
            title: p.title,
            error: p.error,
            file: null, // Files can't be persisted
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load unlocated photos:', error);
    }
    setLoading(false);
  }, []);

  const addPhotos = (newPhotos: UnlocatedPhoto[]) => {
    setPhotos((prev) => {
      const updated = [...prev, ...newPhotos];
      // Persist to localStorage (without File objects)
      try {
        const serializable = updated.map((p) => ({
          id: p.id,
          title: p.title,
          error: p.error,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
      } catch (error) {
        console.error('Failed to save unlocated photos:', error);
      }
      return updated;
    });
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      // Update localStorage
      try {
        const serializable = updated.map((p) => ({
          id: p.id,
          title: p.title,
          error: p.error,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
      } catch (error) {
        console.error('Failed to update unlocated photos:', error);
      }
      return updated;
    });
  };

  const clearAll = () => {
    setPhotos([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear unlocated photos:', error);
    }
  };

  return { photos, loading, addPhotos, removePhoto, clearAll };
}
