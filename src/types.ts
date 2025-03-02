export interface ScanRecord {
  id: string
  qrId: string
  timestamp: number
  userId?: string // Track which user made the scan
  location: {
    latitude: number
    longitude: number
    city?: string
    country?: string
  }
}

export interface QrCodeStats {
  id: string
  code: string  // 6-character alphanumeric code
  scanCount: number
  scans: ScanRecord[]
  createdAt: number
  createdBy?: string // UID of the user who created this QR code
}