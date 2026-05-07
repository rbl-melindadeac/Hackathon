export interface Photo {
  id: string
  fileUrl: string
  lat: number | null
  lng: number | null
  isManuallyPinned: boolean
  createdAt: string
}
