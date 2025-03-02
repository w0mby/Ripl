import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert, 
  Card,
  Container,
  Paper
} from '@mui/material'
import { recordScan, getQrIdFromCode, getQrCodeStats } from '../services/qrCodeService'
import { getCurrentLocation } from '../services/geolocationService'
import { isFirstScanForUser, markQrAsScanned, getOrCreateUserId } from '../services/scanService'

const QrScanner: React.FC = () => {
  const { qrId: codeOrId } = useParams<{ qrId: string }>()
  const navigate = useNavigate()
  const [qrId, setQrId] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [isFirstScan, setIsFirstScan] = useState<boolean>(true)
  const [locationType, setLocationType] = useState<'browser' | 'ip' | 'none' | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // First check if we have a short code or an ID
  useEffect(() => {
    const resolveQrId = async () => {
      if (!codeOrId) {
        setScanError('Invalid QR code')
        setLoading(false)
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
            setScanError('Invalid QR code or code not found')
          }
        } else {
          // Otherwise we assume it's a direct ID
          setQrId(codeOrId)
        }
      } catch (error) {
        console.error('Error resolving QR code:', error)
        setScanError('Error resolving QR code')
      } finally {
        setLoading(false)
      }
    }

    resolveQrId()
  }, [codeOrId])

  // Check if this is a first-time scan once we have the actual QR ID
  useEffect(() => {
    if (qrId) {
      const isFirstTime = isFirstScanForUser(qrId)
      setIsFirstScan(isFirstTime)
    }
  }, [qrId])

  const handleScan = useCallback(async () => {
    if (!qrId) {
      setScanError('Invalid QR code')
      return
    }

    setIsScanning(true)
    setScanError(null)

    try {
      // Get the current user ID (consistent for this browser/device)
      const userId = getOrCreateUserId()
      console.log('User ID for this scan:', userId)

      // Check if this is a new scan for this user
      const isFirstTimeScanning = isFirstScanForUser(qrId)
      console.log('Is first scan?', isFirstTimeScanning ? 'YES' : 'NO')

      // Add a small delay if needed to prevent accidental double-scans
      // This is in addition to the server-side duplicate detection
      const now = Date.now()
      const lastScanKey = `last_scan_time_${qrId}`
      const lastScanTime = parseInt(localStorage.getItem(lastScanKey) || '0')
      const timeSinceLastScan = now - lastScanTime

      if (timeSinceLastScan < 2000) {
        console.log('Client-side duplicate prevention: scan too soon after last scan')
        setScanError('Please wait a moment before scanning again')
        setIsScanning(false)
        return
      }

      // Record this scan time
      localStorage.setItem(lastScanKey, now.toString())

      // If this is a first-time scan, mark it as scanned
      if (isFirstTimeScanning) {
        console.log('Setting scanned flag for QR:', qrId)
        markQrAsScanned(qrId)
      }

      // Then get user's location and record the scan
      const location = await getCurrentLocation()
      
      // Store the location source for UI display
      setLocationType(location.source || 'none')

      try {
        if (location.error) {
          // If there was a geolocation error, still record the scan but without location
          console.log('Recording scan without location')
          await recordScan(qrId, 0, 0, undefined, undefined, isFirstTimeScanning, userId)
        } else {
          // Record the scan with location information
          console.log('Recording scan with location', location)
          await recordScan(
            qrId,
            location.latitude,
            location.longitude,
            location.city || undefined,
            location.country || undefined,
            isFirstTimeScanning, // Pass our determination of whether this is a first scan
            userId // Pass the user ID to track who made this scan
          )
        }
        console.log('Scan recorded successfully')
      } catch (err) {
        console.error('Error in QrScanner when recording scan:', err)
        // Still navigate to stats page even if scan recording fails
      }

      // Get the stats to get the code
      const stats = await getQrCodeStats(qrId)
      
      if (stats && stats.code) {
        // Redirect to the short code URL rather than the UUID
        navigate(`/stats/${stats.code}?new=${isFirstTimeScanning ? '1' : '0'}`)
      } else {
        // Fall back to using the ID if for some reason we can't get the code
        navigate(`/stats/${qrId}?new=${isFirstTimeScanning ? '1' : '0'}`)
      }
    } catch (error) {
      console.error('Error during scan:', error)
      setScanError('Failed to process scan. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }, [qrId, navigate])

  // Run the scan once when component mounts and we have resolved the QR ID
  useEffect(() => {
    // Only run once when we have the resolved QR ID and we're not already scanning
    if (qrId && !isScanning && !scanError && !loading) {
      handleScan()
    }
  }, [qrId, isScanning, scanError, loading, handleScan])

  // Show loading state while resolving QR code
  if (loading) {
    return (
      <Container maxWidth="sm">
        <Card sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" component="h2" color="primary" gutterBottom>
            Ripl.io: Processing Link
          </Typography>
          <CircularProgress size={40} sx={{ m: 2 }} />
          <Typography variant="body1">
            Loading QR code information...
          </Typography>
        </Card>
      </Container>
    )
  }

  // Show error if QR code is invalid
  if (!qrId || scanError === 'Invalid QR code or code not found') {
    return (
      <Container maxWidth="sm">
        <Paper 
          sx={{ 
            p: 4, 
            mt: 4, 
            textAlign: 'center',
            bgcolor: 'error.light',
            color: 'error.contrastText'
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Invalid Ripl.io Link
          </Typography>
          <Typography variant="body1" paragraph>
            This link is not valid or has expired.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm">
      <Card sx={{ p: 4, mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" component="h2" color="primary" gutterBottom>
          Ripl.io: Processing Link
        </Typography>

        {isScanning && (
          <Box sx={{ py: 2 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" gutterBottom>Processing your scan...</Typography>
            
            {isFirstScan ? (
              <Alert severity="info" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
                This is your first time scanning this QR code!
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
                Welcome back! We recognize you've scanned this QR code before.
              </Alert>
            )}
            
            <Typography variant="body2" color="text.secondary">
              {locationType === null && 'Requesting location access...'}
              {locationType === 'browser' && 'Using your precise location (thank you for permission)'}
              {locationType === 'ip' && 'Using approximate location based on your IP address'}
              {locationType === 'none' && 'Unable to determine your location'}
            </Typography>
          </Box>
        )}
        
        {scanError && (
          <Box sx={{ py: 2 }}>
            <Alert severity="error" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              {scanError}
            </Alert>
            
            <Box sx={{ '& > button': { mx: 1 } }}>
              <Button 
                variant="contained" 
                onClick={handleScan}
              >
                Try Again
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={() => navigate(`/stats/${qrId}`)}
              >
                Skip and View Stats
              </Button>
            </Box>
          </Box>
        )}
      </Card>
    </Container>
  )
}

export default QrScanner