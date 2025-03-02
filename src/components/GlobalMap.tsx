import { useEffect, useState, useRef } from 'react'
import { Map, Marker, Popup } from 'react-map-gl'
import type { MapRef } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { 
  Box, 
  Typography, 
  CircularProgress,
  Divider,
  Chip
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import FavoriteIcon from '@mui/icons-material/Favorite'
import PublicIcon from '@mui/icons-material/Public'
import { getGlobalStats, LocationData } from '../services/globalStatsService'

// Mapbox access token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

// Custom map style to ensure a Mercator-like appearance
const mercatorStyleURL = 'mapbox://styles/mapbox/light-v10'


const GlobalMap: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalScans, setTotalScans] = useState(0)
  const [countriesData, setCountriesData] = useState<LocationData[]>([])
  const [selectedCountry, setSelectedCountry] = useState<LocationData | null>(null)
  
  // Using ref for the map
  const mapRef = useRef<MapRef>(null)
  
  useEffect(() => {
    fetchGlobalStats()
  }, [])
  
  const fetchGlobalStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const stats = await getGlobalStats()
      
      setTotalScans(stats.totalScans)
      setCountriesData(stats.uniqueCountries)
      
      console.log(`Loaded global stats: ${stats.uniqueCountries.length} countries, ${stats.totalScans} total scans`)
    } catch (err) {
      console.error('Error fetching global stats:', err)
      setError('Failed to load global statistics')
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoading) {
    return (
      <Box sx={{ 
        height: 400, 
        width: '100%', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} sx={{ color: '#3F72AF' }} />
        <Typography variant="body1" color="text.secondary">
          Loading global data...
        </Typography>
      </Box>
    )
  }
  
  if (error) {
    return (
      <Box sx={{ 
        height: 400, 
        width: '100%', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        bgcolor: '#f5f5f5',
        borderRadius: 2
      }}>
        <PublicIcon sx={{ fontSize: 40, color: '#3F72AF', mb: 2, opacity: 0.7 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please try again later.
        </Typography>
      </Box>
    )
  }
  
  return (
    <Box sx={{ height: 400, width: '100%', position: 'relative' }} className="global-kindness-map home-map">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 0,
          latitude: 30,
          zoom: 1.4,
          pitch: 0,   // Flat view for Mercator
          bearing: 0  // No rotation
        }}
        mapStyle={mercatorStyleURL} // Flat style better for Mercator
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
        dragRotate={false}    // Disable rotation for flat view
        doubleClickZoom={false} // Disable double-click zoom for simplicity
        scrollZoom={false}    // Disable scroll zoom for static view
        dragPan={false}       // Disable panning for static view
        // Using interactive={false} to disable all touch interactions
        interactive={false}   // Disable all interactions
      >
        {/* Country Markers */}
        {countriesData.map((country, index) => (
          <Marker
            key={`country-marker-${index}`}
            longitude={country.longitude}
            latitude={country.latitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation()
              setSelectedCountry(country)
            }}
          >
            <LocationOnIcon 
              className="marker-icon kindness-heart"
              sx={{ 
                color: country.count > 10 ? '#FF7E67' : '#4CAF50',
                fontSize: Math.min(30 + country.count / 2, 50),
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.2)'
                },
                transition: 'all 0.2s ease'
              }}
            />
          </Marker>
        ))}
        
        {/* Popup for Selected Country */}
        {selectedCountry && (
          <Popup
            longitude={selectedCountry.longitude}
            latitude={selectedCountry.latitude}
            anchor="bottom"
            onClose={() => setSelectedCountry(null)}
            closeOnClick={false}
            className="map-popup"
          >
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {selectedCountry.locationName}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <FavoriteIcon color="error" fontSize="small" />
                <Typography variant="body1">
                  <strong>{selectedCountry.count}</strong> thank yous received
                </Typography>
              </Box>
            </Box>
          </Popup>
        )}
      </Map>
      
      {/* Stats Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 999,
          p: 1.5,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 2,
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Chip 
            icon={<FavoriteIcon sx={{ color: '#FF7E67' }} />} 
            label={`${totalScans} Acts of Kindness`}
            sx={{ fontWeight: 'bold' }}
          />
          <Chip 
            icon={<PublicIcon sx={{ color: '#3F72AF' }} />}
            label={`${countriesData.length} Countries`}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default GlobalMap