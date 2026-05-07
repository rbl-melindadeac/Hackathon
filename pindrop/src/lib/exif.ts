import * as exifr from 'exifr';

export interface PhotoWithLocation {
  id: string;
  file: File;
  lat: number;
  lng: number;
  title: string;
}

export interface PhotoWithoutLocation {
  id: string;
  file: File;
  title: string;
  error?: string;
}

export interface ExtractionResult {
  geotagged: PhotoWithLocation[];
  unlocated: PhotoWithoutLocation[];
}

/**
 * Extract GPS coordinates from photo EXIF data
 * Returns photos separated into geotagged and unlocated
 * Errors are handled gracefully - problematic files go to unlocated
 */
export async function extractGPSFromPhotos(
  files: File[]
): Promise<ExtractionResult> {
  const geotagged: PhotoWithLocation[] = [];
  const unlocated: PhotoWithoutLocation[] = [];

  // Process files sequentially (or in parallel with Promise.all for speed)
  const extractionPromises = files.map((file, index) =>
    extractPhotoGPS(file, index)
  );

  const results = await Promise.all(extractionPromises);

  results.forEach((result) => {
    if (result.type === 'geotagged' && result.location) {
      geotagged.push(result.location as PhotoWithLocation);
    } else {
      unlocated.push(result.location as PhotoWithoutLocation);
    }
  });

  return { geotagged, unlocated };
}

/**
 * Extract GPS from a single photo
 * Returns either geotagged or unlocated result
 */
async function extractPhotoGPS(
  file: File,
  index: number
): Promise<{
  type: 'geotagged' | 'unlocated';
  location: PhotoWithLocation | PhotoWithoutLocation;
}> {
  const id = `${Date.now()}-${index}`;
  const title = getPhotoTitle(file.name);

  try {
    // Extract EXIF data from file
    const exifData = await exifr.parse(file);

    // Check if GPS coordinates exist
    if (exifData && exifData.latitude && exifData.longitude) {
      return {
        type: 'geotagged',
        location: {
          id,
          file,
          lat: exifData.latitude,
          lng: exifData.longitude,
          title,
        },
      };
    } else {
      // No GPS data found
      return {
        type: 'unlocated',
        location: {
          id,
          file,
          title,
          error:
            "This photo doesn't have GPS data — likely shared via a messaging app which removes location info.",
        },
      };
    }
  } catch {
    return {
      type: 'unlocated',
      location: {
        id,
        file,
        title,
        error: `Couldn't read GPS data. Try re-uploading from your camera, or pin the photo manually.`,
      },
    };
  }
}

/**
 * Generate a readable title from filename
 * Examples: "IMG_1234.jpg" → "IMG 1234"
 */
function getPhotoTitle(filename: string): string {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  // Replace underscores/hyphens with spaces
  const readable = nameWithoutExt.replace(/[_-]/g, ' ');
  return readable || 'Untitled Photo';
}
