import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Photo {
  id: string;
  lat: number;
  lng: number;
  title: string;
  file_url?: string;
  is_manually_pinned?: boolean;
  created_at?: string;
}

export interface UploadPhoto {
  file: File;
  lat: number;
  lng: number;
  title: string;
}

const isPlaceholder = supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder');

export async function fetchPhotos(): Promise<Photo[]> {
  try {
    // If Supabase credentials are placeholders, use mock data
    if (isPlaceholder) {
      return getMockPhotos();
    }

    // Real Supabase query
    const { data, error } = await supabase
      .from('photos')
      .select()
      .not('lat', 'is', null)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    return (data as Photo[]) || [];
  } catch (error) {
    console.error('Failed to fetch photos:', error);
    // Fallback to mock data on error
    return getMockPhotos();
  }
}

export async function uploadPhoto(photo: UploadPhoto): Promise<Photo> {
  if (isPlaceholder) {
    // Mock upload for placeholder credentials
    return mockUploadPhoto(photo);
  }

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

    // Insert record into photos table
    const { data, error: insertError } = await supabase
      .from('photos')
      .insert([
        {
          file_url,
          lat: photo.lat,
          lng: photo.lng,
          is_manually_pinned: false,
          title: photo.title,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return {
      id: data.id,
      lat: data.lat,
      lng: data.lng,
      title: data.title,
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
  if (isPlaceholder) {
    // Mock update with slight delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(
          `Mock: Updated photo ${photoId} to ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`
        );
        resolve();
      }, 300);
    });
  }

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

function mockUploadPhoto(photo: UploadPhoto): Promise<Photo> {
  // Mock upload with slight delay to simulate network
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const mockFileUrl = `https://mock.supabase.co/photos/${id}`;

      resolve({
        id,
        lat: photo.lat,
        lng: photo.lng,
        title: photo.title,
        file_url: mockFileUrl,
        is_manually_pinned: false,
        created_at: new Date().toISOString(),
      });
    }, 300); // Simulate 300ms upload time
  });
}

function getMockPhotos(): Photo[] {
  // Mock photos for testing without Supabase
  return [
    {
      id: 'mock-1',
      lat: 51.505,
      lng: -0.09,
      title: 'Test Photo - London',
    },
    {
      id: 'mock-2',
      lat: 48.8566,
      lng: 2.3522,
      title: 'Eiffel Tower - Paris',
    },
    {
      id: 'mock-3',
      lat: 40.7128,
      lng: -74.006,
      title: 'Statue of Liberty - New York',
    },
    {
      id: 'mock-4',
      lat: 35.6762,
      lng: 139.6503,
      title: 'Senso-ji Temple - Tokyo',
    },
    {
      id: 'mock-5',
      lat: -33.8688,
      lng: 151.2093,
      title: 'Opera House - Sydney',
    },
  ];
}
