import { useState, useEffect, useRef } from 'react';

export interface UnlocatedPhoto {
  id: string;
  file: File;
  title: string;
  error?: string;
}

const STORAGE_KEY = 'pindrop_unlocated_photos';
const filesMapRef = new Map<string, File>();

export function useUnlocatedPhotos() {
  const [photos, setPhotos] = useState<UnlocatedPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPhotos(
          parsed.map((p: any) => ({
            id: p.id,
            title: p.title,
            error: p.error,
            file: filesMapRef.get(p.id) || new File([], p.title),
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

      // Store File objects in memory map
      newPhotos.forEach((p) => {
        filesMapRef.set(p.id, p.file);
      });

      // Persist only metadata to localStorage
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
      filesMapRef.delete(id);

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
    filesMapRef.clear();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear unlocated photos:', error);
    }
  };

  return { photos, loading, addPhotos, removePhoto, clearAll };
}
