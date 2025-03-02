import { useEffect, useState, useRef } from 'react'
import { Map, Marker, Popup } from 'react-map-gl'
import type { ViewStateChangeEvent, MapRef } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { 
  Box, 
  Typography, 
  CircularProgress,
  Divider,
  Chip,
  Collapse,
  IconButton,
  Paper
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import FavoriteIcon from '@mui/icons-material/Favorite'
import PublicIcon from '@mui/icons-material/Public'
import QrCodeIcon from '@mui/icons-material/QrCode'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LegendToggleIcon from '@mui/icons-material/LegendToggle'
import { getGlobalStats, LocationData } from '../services/globalStatsService'

// Mapbox access token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''


const MapPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalScans, setTotalScans] = useState(0)
  const [totalQrCodes, setTotalQrCodes] = useState(0)
  const [locationsData, setLocationsData] = useState<LocationData[]>([])
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [focusCenter, setFocusCenter] = useState<{longitude: number, latitude: number, zoom: number} | null>(null)
  const [locationCount, setLocationCount] = useState(0)
  const [legendOpen, setLegendOpen] = useState(false) // Default collapsed on mobile
  
  // Using ref for the map
  const mapRef = useRef<MapRef>(null)
  
  useEffect(() => {
    fetchGlobalStats()
  }, [])
  
  // Auto-expand legend on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 600) { // Material UI 'sm' breakpoint
        setLegendOpen(true);
      } else {
        setLegendOpen(false);
      }
    };
    
    // Set initial state based on screen size
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [])
  
  const fetchGlobalStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const stats = await getGlobalStats()
      
      setTotalScans(stats.totalScans)
      setTotalQrCodes(stats.totalQrCodes)
      
      // Use city-level data when available, fall back to country data only when needed
      const locations = [...stats.uniqueLocations];
      
      // For any countries not already covered by cities, add those too
      stats.uniqueCountries.forEach(country => {
        // Only add countries that don't have any cities in that country
        const hasCitiesInCountry = locations.some(
          loc => loc.locationType === 'city' && loc.country === country.locationName
        );
        
        if (!hasCitiesInCountry) {
          locations.push(country);
        }
      });
      
      setLocationsData(locations);
      setLocationCount(locations.length);
      
      // Find focus center based on hotspot (most active region)
      if (locations.length > 0) {
        // First check if we have locations with significant activity
        const hotLocations = locations.filter(l => l.count > 5)
        
        if (hotLocations.length > 0) {
          // Calculate center of active locations as weighted by scan count
          let totalWeight = 0
          let weightedLat = 0
          let weightedLng = 0
          
          hotLocations.forEach(location => {
            const weight = location.count
            totalWeight += weight
            weightedLat += location.latitude * weight
            weightedLng += location.longitude * weight
          })
          
          // Set focus with weighted center
          setFocusCenter({
            latitude: weightedLat / totalWeight,
            longitude: weightedLng / totalWeight,
            zoom: 2.5
          })
        } else {
          // Just use the most active location if no significant hotspots
          const mostActive = locations[0]
          setFocusCenter({
            latitude: mostActive.latitude,
            longitude: mostActive.longitude,
            zoom: 3
          })
        }
      }
      
      console.log(`Loaded global stats: ${stats.uniqueLocations.length} cities, ${stats.uniqueCountries.length} countries, ${stats.totalScans} total scans`)
    } catch (err) {
      console.error('Error fetching global stats:', err)
      setError('Failed to load global statistics')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle map movement to recenter
  const handleMapMove = (evt: ViewStateChangeEvent) => {
    // Remove focus center once user has interacted with the map
    if (focusCenter && (evt.viewState.zoom !== focusCenter.zoom)) {
      setFocusCenter(null)
    }
  }
  
  if (isLoading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'white',
          zIndex: 999
        }}
      >
        <CircularProgress size={50} sx={{ color: '#3F72AF' }} />
        <Typography variant="body1" color="text.secondary">
          Loading global kindness map...
        </Typography>
      </Box>
    )
  }
  
  if (error) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          bgcolor: '#f5f5f5',
          zIndex: 999
        }}
      >
        <PublicIcon sx={{ fontSize: 60, color: '#3F72AF', mb: 2, opacity: 0.7 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please try again later.
        </Typography>
      </Box>
    )
  }
  
  return (
    <Box 
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100vh'
      }}
    >
      <Box sx={{ height: '100%', width: '100%' }} className="global-kindness-map fullscreen-map">
          <Map
            ref={mapRef}
            initialViewState={focusCenter ? {
              longitude: focusCenter.longitude,
              latitude: focusCenter.latitude,
              zoom: focusCenter.zoom
            } : {
              longitude: 0,
              latitude: 20,
              zoom: 1.5
            }}
            onMove={handleMapMove}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            {/* Location Markers */}
            {locationsData.map((location, index) => (
              <Marker
                key={`location-marker-${index}`}
                longitude={location.longitude}
                latitude={location.latitude}
                anchor="bottom"
                onClick={e => {
                  e.originalEvent.stopPropagation()
                  setSelectedLocation(location)
                }}
              >
                {location.locationType === 'city' ? (
                  <LocationCityIcon 
                    className="marker-icon kindness-heart"
                    sx={{ 
                      color: location.count > 10 ? '#FF7E67' : '#4CAF50',
                      fontSize: Math.min(25 + location.count / 2, 45),
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.2)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  />
                ) : (
                  <LocationOnIcon 
                    className="marker-icon kindness-heart"
                    sx={{ 
                      color: location.count > 10 ? '#e57373' : '#81c784',
                      fontSize: Math.min(30 + location.count / 2, 50),
                      cursor: 'pointer',
                      opacity: 0.8, // Make country markers slightly transparent
                      '&:hover': {
                        transform: 'scale(1.2)',
                        opacity: 1
                      },
                      transition: 'all 0.2s ease'
                    }}
                  />
                )}
              </Marker>
            ))}
            
            {/* Popup for Selected Location */}
            {selectedLocation && (
              <Popup
                longitude={selectedLocation.longitude}
                latitude={selectedLocation.latitude}
                anchor="bottom"
                onClose={() => setSelectedLocation(null)}
                closeOnClick={false}
                className="map-popup"
              >
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {selectedLocation.locationName}
                    {selectedLocation.locationType === 'city' && selectedLocation.country && 
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {selectedLocation.country}
                      </Typography>
                    }
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <FavoriteIcon color="error" fontSize="small" />
                    <Typography variant="body1">
                      <strong>{selectedLocation.count}</strong> thank yous received
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                    {selectedLocation.locationType === 'city' ? 'City' : 'Country'} marker
                  </Typography>
                </Box>
              </Popup>
            )}
          </Map>
          
          {/* Stats Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 80,
              right: 10,
              zIndex: 999,
              p: 1,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(4px)'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1
            }}>
              <Chip 
                icon={<FavoriteIcon sx={{ color: '#FF7E67' }} />} 
                label={`${totalScans} Acts`}
                size="small"
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '0.7rem'
                }}
              />
              <Chip 
                icon={<LocationCityIcon sx={{ color: '#3F72AF' }} />}
                label={`${locationCount} Locations`}
                size="small"
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '0.7rem'
                }}
              />
              <Chip 
                icon={<QrCodeIcon sx={{ color: '#4CAF50' }} />}
                label={`${totalQrCodes} QR Codes`}
                size="small"
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '0.7rem'
                }}
              />
            </Box>
          </Box>
          
          {/* Legend - Collapsible */}
          <Paper
            elevation={2}
            sx={{
              position: 'absolute',
              bottom: { xs: 70, sm: 40 },
              left: 20,
              zIndex: 999,
              borderRadius: 2,
              overflow: 'hidden',
              maxWidth: { xs: 190, sm: 220 },
              transition: 'all 0.3s ease'
            }}
          >
            {/* Legend Header - Always visible */}
            <Box 
              sx={{
                p: 1,
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
                borderBottom: legendOpen ? '1px solid rgba(0,0,0,0.1)' : 'none'
              }}
              onClick={() => setLegendOpen(!legendOpen)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LegendToggleIcon fontSize="small" sx={{ color: '#3F72AF' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Map Legend
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                sx={{ p: 0.5 }}
                aria-label={legendOpen ? "collapse legend" : "expand legend"}
              >
                {legendOpen ? (
                  <KeyboardArrowUpIcon fontSize="small" />
                ) : (
                  <KeyboardArrowDownIcon fontSize="small" />
                )}
              </IconButton>
            </Box>
            
            {/* Collapsible Legend Content */}
            <Collapse in={legendOpen}>
              <Box sx={{ 
                p: 1.5, 
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationCityIcon sx={{ color: '#4CAF50' }} /> 
                  <Typography variant="body2">City (1-10 scans)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationCityIcon sx={{ color: '#FF7E67' }} /> 
                  <Typography variant="body2">Active City (&gt;10 scans)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOnIcon sx={{ color: '#81c784', opacity: 0.8 }} /> 
                  <Typography variant="body2">Country (1-10 scans)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon sx={{ color: '#e57373', opacity: 0.8 }} /> 
                  <Typography variant="body2">Active Country (&gt;10 scans)</Typography>
                </Box>
              </Box>
            </Collapse>
          </Paper>
        </Box>
    </Box>
  )
}

export default MapPage