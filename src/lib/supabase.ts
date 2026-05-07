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

export async function fetchPhotos(): Promise<Photo[]> {
  try {
    // If Supabase credentials are placeholders, use mock data
    if (
      supabaseUrl.includes('placeholder') ||
      supabaseAnonKey.includes('placeholder')
    ) {
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
