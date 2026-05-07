import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Photo {
  id: string;
  lat: number | null;
  lng: number | null;
  file_url?: string;
  is_manually_pinned?: boolean;
  created_at?: string;
}

export interface UploadPhoto {
  file: File;
  lat: number | null;
  lng: number | null;
}

// Fetch ALL photos (with or without location)
export async function fetchPhotos(): Promise<Photo[]> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select()
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    return (data as Photo[]) || [];
  } catch (error) {
    console.error('Failed to fetch photos:', error);
    throw error;
  }
}

// Fetch only photos WITH location (for map display)
export async function fetchPhotosWithLocation(): Promise<Photo[]> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select()
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    return (data as Photo[]) || [];
  } catch (error) {
    console.error('Failed to fetch photos with location:', error);
    throw error;
  }
}

// Fetch only photos WITHOUT location (for unlocated photos display)
export async function fetchUnlocatedPhotos(): Promise<Photo[]> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select()
      .is('lat', null)
      .is('lng', null)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    return (data as Photo[]) || [];
  } catch (error) {
    console.error('Failed to fetch unlocated photos:', error);
    throw error;
  }
}

// Upload photo to Supabase Storage AND Database (with or without location)
export async function uploadPhoto(photo: UploadPhoto): Promise<Photo> {
  try {
    // Upload file to Supabase Storage
    const fileExt = photo.file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, photo.file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    const file_url = publicUrlData.publicUrl;

    // Insert record into photos table (even if no location)
    const { data, error: insertError } = await supabase
      .from('photos')
      .insert([
        {
          file_url,
          lat: photo.lat || null,
          lng: photo.lng || null,
          is_manually_pinned: false,
        },
      ])
      .select('*')
      .single();

    if (insertError) throw insertError;

    if (!data || !data.id) {
      throw new Error('Failed to get photo ID from database');
    }

    return {
      id: data.id,
      lat: data.lat,
      lng: data.lng,
      file_url: data.file_url,
      is_manually_pinned: data.is_manually_pinned,
      created_at: data.created_at,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    throw new Error(`Failed to upload photo: ${message}`);
  }
}

export async function updatePhotoCoordinates(
  photoId: string,
  lat: number,
  lng: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('photos')
      .update({
        lat,
        lng,
        is_manually_pinned: true,
      })
      .eq('id', photoId);

    if (error) throw error;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    throw new Error(`Failed to update photo coordinates: ${message}`);
  }
}
