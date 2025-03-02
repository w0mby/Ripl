import { 
  collection,
  getDocs
} from 'firebase/firestore'
import { db } from '../firebase'
import { QrCodeStats, ScanRecord } from '../types'

const QR_COLLECTION = 'qrCodes'

export interface LocationData {
  locationName: string
  locationType: 'city' | 'country'
  country?: string
  count: number
  latitude: number
  longitude: number
}

export interface GlobalStats {
  totalScans: number
  uniqueLocations: LocationData[]
  uniqueCountries: LocationData[]
  recentScans: ScanRecord[]
  totalQrCodes: number
}

/**
 * Get global statistics for all QR codes
 * Shows all locations (cities and countries) with scan data
 */
export const getGlobalStats = async (): Promise<GlobalStats> => {
  try {
    const querySnapshot = await getDocs(collection(db, QR_COLLECTION))
    const allQrCodes: QrCodeStats[] = []
    
    querySnapshot.forEach((doc) => {
      allQrCodes.push(doc.data() as QrCodeStats)
    })
    
    // Count total scans
    const totalScans = allQrCodes.reduce((sum, qr) => sum + qr.scanCount, 0)
    
    // Count total QR codes
    const totalQrCodes = allQrCodes.length
    
    // Get all scans across all QR codes
    const allScans = allQrCodes.flatMap(qr => qr.scans || [])
    
    // Sort scans by timestamp (newest first)
    const recentScans = [...allScans].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20)
    
    // Maps for locations and countries
    const cityMap = new Map<string, { count: number, lat: number, lng: number, country?: string }>()
    const countryMap = new Map<string, { count: number, lat: number, lng: number }>()
    
    // Process all scan records
    allScans.forEach(scan => {
      // Group by city if available
      if (scan.location.city && scan.location.country) {
        // Create a composite key to handle cities with the same name in different countries
        const cityKey = `${scan.location.city}, ${scan.location.country}`
        
        if (cityMap.has(cityKey)) {
          // Increment count for existing city
          const existing = cityMap.get(cityKey)!
          cityMap.set(cityKey, {
            count: existing.count + 1,
            lat: existing.lat,
            lng: existing.lng,
            country: scan.location.country
          })
        } else {
          // Add new city with coordinates
          cityMap.set(cityKey, {
            count: 1,
            lat: scan.location.latitude,
            lng: scan.location.longitude,
            country: scan.location.country
          })
        }
      }
      
      // Always track countries as a fallback
      if (scan.location.country) {
        const countryKey = scan.location.country
        
        if (countryMap.has(countryKey)) {
          // Increment count for existing country
          const existing = countryMap.get(countryKey)!
          countryMap.set(countryKey, {
            count: existing.count + 1,
            lat: existing.lat,
            lng: existing.lng
          })
        } else {
          // Add new country with coordinates
          countryMap.set(countryKey, {
            count: 1,
            lat: scan.location.latitude,
            lng: scan.location.longitude
          })
        }
      }
    })
    
    // Convert city map to array of location data
    const uniqueLocations: LocationData[] = Array.from(cityMap.entries()).map(([cityKey, data]) => {
      // Split the composite key back to city and country
      const parts = cityKey.split(', ');
      const city = parts[0] || '';
      const country = parts.length > 1 ? parts[1] : '';
      
      return {
        locationName: city,
        locationType: 'city',
        country: country,
        count: data.count,
        latitude: data.lat,
        longitude: data.lng
      }
    })
    
    // Convert country map to array of location data
    const uniqueCountries: LocationData[] = Array.from(countryMap.entries()).map(([country, data]) => ({
      locationName: country,
      locationType: 'country',
      count: data.count,
      latitude: data.lat,
      longitude: data.lng
    }))
    
    // Sort locations by scan count (highest first)
    uniqueLocations.sort((a, b) => b.count - a.count)
    uniqueCountries.sort((a, b) => b.count - a.count)
    
    return {
      totalScans,
      uniqueLocations,
      uniqueCountries,
      recentScans,
      totalQrCodes
    }
  } catch (error) {
    console.error('Error getting global stats:', error)
    return {
      totalScans: 0,
      uniqueLocations: [],
      uniqueCountries: [],
      recentScans: [],
      totalQrCodes: 0
    }
  }
}