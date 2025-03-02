import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { Map, Marker, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  Divider, 
  Chip, 
  Stack,
  Button,
  Avatar
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import WavesIcon from '@mui/icons-material/Waves'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PublicIcon from '@mui/icons-material/Public'
import { getQrCodeStats, getQrIdFromCode } from '../services/qrCodeService'
import { QrCodeStats, ScanRecord } from '../types'

// Mapbox access token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

const QrStats: React.FC = () => {
  // All state and hooks must be declared at the top
  const { qrId: codeOrId } = useParams<{ qrId: string }>()
  const location = useLocation()
  const [qrId, setQrId] = useState<string | null>(null)
  const [stats, setStats] = useState<QrCodeStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFirstScan, setIsFirstScan] = useState<boolean | null>(null)
  // Using more specific type for Mapbox GL's MapRef
  const mapRef = useRef(null)
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null)
  
  // Create a useMemo hook to calculate some additional stats
  const stats_memo = useMemo(() => {
    if (!stats) return null;
    
    // Get most recent scan
    const sortedScans = [...(stats.scans || [])].sort((a, b) => b.timestamp - a.timestamp);
    const mostRecentScan = sortedScans.length > 0 ? sortedScans[0] : null;
    
    // Count scans by country
    const countryCounts = (stats.scans || []).reduce((acc: Record<string, number>, scan) => {
      const country = scan.location.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});
    
    // Sort countries by scan count (descending)
    const topCountries = Object.entries(countryCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5);
      
    return {
      mostRecentScan,
      topCountries,
      countryCounts
    };
  }, [stats])

  // Make sure all useEffect hooks are defined at top level and never conditionally
  
  // Effect 1: Update stats on load
  // First, resolve the code or ID to an actual QR ID
  useEffect(() => {
    const resolveQrId = async () => {
      if (!codeOrId) {
        setError('Invalid QR Code ID')
        setIsLoading(false)
        return
      }

      try {
        // If it's a 6-character code, we need to resolve it to an ID
        if (codeOrId.length === 6) {
          console.log('Resolving short code to ID:', codeOrId)
          const id = await getQrIdFromCode(codeOrId)
          
          if (id) {
            console.log('Resolved to ID:', id)
            setQrId(id)
          } else {
            console.error('Invalid QR code or code not found')
            setError('Invalid QR code or code not found')
            setIsLoading(false)
          }
        } else {
          // Otherwise we assume it's a direct ID
          setQrId(codeOrId)
        }
      } catch (error) {
        console.error('Error resolving QR code:', error)
        setError('Error resolving QR code')
        setIsLoading(false)
      }
    }

    resolveQrId()
  }, [codeOrId])

  // Then fetch stats once we have the ID
  useEffect(() => {
    if (qrId) {
      fetchStats()
    }
  }, [qrId]) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Effect 2: Handle first-scan status from URL parameter
  useEffect(() => {
    if (qrId) {
      // Parse the URL parameter to determine if this was a new scan
      const searchParams = new URLSearchParams(location.search)
      const newParam = searchParams.get('new')
      
      if (newParam !== null) {
        // We have information directly from QrScanner about whether this was a new scan
        setIsFirstScan(newParam === '1')
      } else {
        // This is when someone visits the stats page directly without scanning first
        // In this case, we don't show either message since we don't know their status
        setIsFirstScan(null)
      }
    }
  }, [qrId, location])
  
  // Effect 3: Log when stats are loaded for debugging
  useEffect(() => {
    if (stats) {
      console.log('Stats loaded, scanCount:', stats.scanCount, 'scans:', stats.scans.length)
    }
  }, [stats])
  
  const fetchStats = async () => {
    if (!qrId) {
      setError('Invalid QR Code ID')
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const statsData = await getQrCodeStats(qrId)
      
      if (!statsData) {
        setError('QR Code not found')
      } else {
        setStats(statsData)
        
        // Update the URL to show the short code if we're currently on the UUID URL
        if (codeOrId && codeOrId !== statsData.code && window.history) {
          // Make sure codeOrId is a string before using it in replace
          const newUrl = window.location.pathname.replace(codeOrId, statsData.code) + window.location.search
          window.history.replaceState({}, '', newUrl)
        }
      }
    } catch (err) {
      console.error('Error fetching QR stats:', err)
      setError('Failed to load QR code statistics')
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="qr-stats loading">
        <h2>Loading QR Code Statistics</h2>
        <p>Please wait while we fetch the data...</p>
      </div>
    )
  }
  
  if (error || !stats) {
    return (
      <div className="qr-stats error">
        <h2>Error</h2>
        <p>{error || 'Failed to load QR code statistics'}</p>
        <button onClick={fetchStats}>Try Again</button>
      </div>
    )
  }
  
  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  // Calculate statistics
  const createdDate = formatDate(stats.createdAt)
  const uniqueLocations = new Set(
    stats.scans
      .filter(scan => scan.location.country)
      .map(scan => scan.location.country)
  ).size
  
  // Points for the map
  const points = stats.scans
    .filter(scan => scan.location.latitude !== 0 && scan.location.longitude !== 0)
    .map(scan => ({
      longitude: scan.location.longitude,
      latitude: scan.location.latitude,
      city: scan.location.city || 'Unknown',
      country: scan.location.country || 'Unknown',
      timestamp: scan.timestamp
    }))
  

  return (
    <Box className="qr-stats" sx={{ mb: 6 }}>
      {/* Header Section */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #DBE2EF 0%, #FFFFFF 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: '#112D4E',
              textAlign: 'center',
              mb: 1,
              fontFamily: "'Montserrat', sans-serif"
            }}
          >
            Ripl.io: Kindness Impact
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#3F72AF',
              textAlign: 'center',
              mb: 3,
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: '1px'
            }}
          >
            <a href={`https://orleans-39b46.web.app/r/${stats.code}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              orleans-39b46.web.app/r/<span style={{ fontWeight: 'bold' }}>{stats.code}</span>
            </a>
          </Typography>
          
          {/* Sharing Call to Action with scan acknowledgment */}
          <Paper 
            elevation={3}
            className="sharing-cta"
            sx={{ 
              p: 3, 
              mb: 4, 
              textAlign: 'center',
              backgroundColor: '#FF7E67',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: '#e06e59'
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
              {isFirstScan 
                ? "Thank You For Your Kindness!"
                : "Welcome Back, Kind Soul!"}
            </Typography>
            <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
              {isFirstScan
                ? "Your scan has been counted on our global kindness map. Every act of gratitude makes the world a better place!"
                : "Your continued kindness is appreciated and tracked on our map!"}
            </Typography>
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 'medium' }}>
              Keep the kindness flowing by sharing your Ripl.io link with people who have been kind to you. 
              Each new scan creates another ripple in our worldwide ocean of gratitude!
            </Typography>
          </Paper>
          
          {/* Stats Cards */}
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 3 },
              justifyContent: 'center',
              mt: 3,
              width: '100%'
            }}
          >
            <Card 
              raised 
              className="kindness-card"
              sx={{ 
                width: { xs: '100%', sm: '30%' }, 
                textAlign: 'center',
                borderRadius: 3,
                background: 'white'
              }}
            >
              <CardContent>
                <Box position="relative" display="inline-flex" mb={1}>
                  <WavesIcon sx={{ color: '#3F72AF', fontSize: 40 }} />
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    sx={{ transform: 'translate(-50%, -50%)' }}
                  >
                    <FavoriteIcon fontSize="small" sx={{ color: '#FF7E67' }} />
                  </Box>
                </Box>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {stats.scanCount}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Acts of Kindness
                </Typography>
              </CardContent>
            </Card>
            
            <Card 
              raised 
              sx={{ 
                width: { xs: '100%', sm: '30%' }, 
                textAlign: 'center',
                borderRadius: 3,
                background: 'white'
              }}
            >
              <CardContent>
                <PublicIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {uniqueLocations}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Countries Reached
                </Typography>
              </CardContent>
            </Card>
            
            <Card 
              raised 
              sx={{ 
                width: { xs: '100%', sm: '30%' }, 
                textAlign: 'center',
                borderRadius: 3,
                background: 'white'
              }}
            >
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Started On
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'medium' }}>
                  {createdDate}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Your Kindness Journey
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>
      
      {/* World Map Section */}
      <Paper elevation={3} sx={{ mb: 4, p: 0, borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          backgroundColor: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ 
              color: 'primary.main', 
              fontWeight: 'medium'
            }}
          >
            Kindness Around the World
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary'
            }}
          >
            Each point represents a moment of gratitude shared across the globe.
            Click on a marker to see details.
          </Typography>
        </Box>
        
        {points.length > 0 ? (
          <Box sx={{ height: 500, width: '100%' }} className="global-kindness-map">
            <Map
              ref={mapRef}
              initialViewState={{
                longitude: 0,
                latitude: 30,
                zoom: 1.5
              }}
              mapStyle="mapbox://styles/mapbox/light-v11"
              mapboxAccessToken={MAPBOX_TOKEN}
            >
              {points.map((point, index) => (
                <Marker
                  key={`marker-${index}`}
                  longitude={point.longitude}
                  latitude={point.latitude}
                  anchor="bottom"
                  onClick={e => {
                    e.originalEvent.stopPropagation();
                    const scan = stats.scans.find(
                      s => s.location.latitude === point.latitude && 
                           s.location.longitude === point.longitude
                    );
                    if (scan) setSelectedScan(scan);
                  }}
                >
                  <LocationOnIcon 
                    className="marker-icon kindness-heart"
                    sx={{ 
                      color: '#FF7E67',
                      fontSize: 30,
                      cursor: 'pointer',
                      '&:hover': {
                        color: '#e06e59',
                        transform: 'scale(1.2)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  />
                </Marker>
              ))}
              
              {selectedScan && (
                <Popup
                  longitude={selectedScan.location.longitude}
                  latitude={selectedScan.location.latitude}
                  anchor="bottom"
                  onClose={() => setSelectedScan(null)}
                  closeOnClick={false}
                  className="map-popup"
                >
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {selectedScan.location.city ? `${selectedScan.location.city}, ` : ''}
                      {selectedScan.location.country || 'Unknown location'}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Scanned on {formatDate(selectedScan.timestamp)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FavoriteIcon color="error" fontSize="small" /> Thank you for your kindness!
                    </Typography>
                  </Box>
                </Popup>
              )}
            </Map>
          </Box>
        ) : (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No location data available for this QR code yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              When people scan your code, their locations will appear on this map
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Kindness Insights Section */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
        width: '100%' 
      }}>
        {/* Top Countries */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            flex: 1, 
            borderRadius: 8,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderTop: '2px solid #3F72AF'
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', mb: 3 }}>
            Top Kindness Regions
          </Typography>
          
          {stats_memo?.topCountries && stats_memo.topCountries.length > 0 ? (
            <Stack spacing={2}>
              {stats_memo.topCountries.map(([country, count]) => (
                <Box 
                  key={country}
                  className="country-list-item"
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#DBE2EF', color: '#3F72AF' }}>
                      {country.substring(0, 1)}
                    </Avatar>
                    <Typography variant="body1">{country}</Typography>
                  </Box>
                  <Chip 
                    label={`${count} ${count === 1 ? 'scan' : 'scans'}`} 
                    sx={{ 
                      bgcolor: '#3F72AF', 
                      color: 'white', 
                      fontWeight: 'medium' 
                    }}
                    size="small"
                  />
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No country data available yet
            </Typography>
          )}
          
          <Button 
            variant="outlined" 
            sx={{ mt: 3 }}
            component={Link}
            to="/create"
          >
            Create Another Thank You
          </Button>
        </Paper>
        
        {/* Recent Activity */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            flex: 1, 
            borderRadius: 8,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderTop: '2px solid #3F72AF'
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', mb: 3 }}>
            Kindness Timeline
          </Typography>
          
          {stats.scans.length > 0 ? (
            <Stack spacing={2} sx={{ maxHeight: 400, overflow: 'auto' }}>
              {[...stats.scans]
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(scan => (
                <Box 
                  key={scan.id}
                  sx={{ 
                    display: 'flex',
                    gap: 2,
                    pb: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Avatar sx={{ bgcolor: '#DBE2EF' }}>
                    <FavoriteIcon sx={{ color: '#FF7E67' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {scan.location.city && scan.location.country 
                        ? `${scan.location.city}, ${scan.location.country}`
                        : scan.location.country || 'Unknown location'
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(scan.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No scan history yet
            </Typography>
          )}
          
          <Typography variant="body2" sx={{ mt: 4, fontStyle: 'italic', color: 'text.secondary' }}>
            Every scan represents someone taking a moment to share gratitude.
            Thank you for being part of this global kindness movement.
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}

export default QrStats