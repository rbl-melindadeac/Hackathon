import exifr from 'exifr'

export async function extractGPS(file: File): Promise<{ lat: number; lng: number } | null> {
  try {
    const gps = await exifr.gps(file)
    if (!gps || gps.latitude == null || gps.longitude == null) return null
    return { lat: gps.latitude, lng: gps.longitude }
  } catch {
    return null
  }
}
