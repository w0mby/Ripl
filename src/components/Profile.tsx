import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserQrCodes } from '../services/qrCodeService';
import { QrCodeStats } from '../types';
import { 
  Container, 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Avatar, 
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import FavoriteIcon from '@mui/icons-material/Favorite';
import WavesIcon from '@mui/icons-material/Waves';
import PersonIcon from '@mui/icons-material/Person';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PublicIcon from '@mui/icons-material/Public';

const Profile: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userQrCodes, setUserQrCodes] = useState<QrCodeStats[]>([]);
  const [isLoadingQrCodes, setIsLoadingQrCodes] = useState(true);
  
  // Load user's QR codes
  useEffect(() => {
    const fetchUserQrCodes = async () => {
      if (currentUser?.uid) {
        setIsLoadingQrCodes(true);
        try {
          const codes = await getUserQrCodes(currentUser.uid);
          setUserQrCodes(codes);
        } catch (err) {
          console.error("Error fetching user's QR codes:", err);
        } finally {
          setIsLoadingQrCodes(false);
        }
      }
    };
    
    fetchUserQrCodes();
  }, [currentUser]);

  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await signOut();
      
      if (result.error) {
        setError('Failed to sign out. Please try again.');
      } else {
        setSuccess('Signed out successfully');
        // Navigate to home page after short delay
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error) {
      setError('Failed to sign out. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser?.displayName) return '?';
    
    const names = currentUser.displayName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 8,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderTop: '2px solid #3F72AF',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                color: '#112D4E', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 2,
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              <PersonIcon sx={{ color: '#FF7E67' }} /> Your Profile
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'flex-start' },
              gap: 4, 
              mb: 4 
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                width: { xs: '100%', md: '200px' }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  bgcolor: '#3F72AF',
                  fontSize: '2.5rem',
                  fontWeight: 600,
                  mb: 2
                }}
              >
                {currentUser?.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || 'User'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  getUserInitials()
                )}
              </Avatar>
              
              <Button
                variant="outlined"
                color="error"
                onClick={handleSignOut}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <LogoutIcon />}
                sx={{
                  mt: 2,
                  borderColor: '#FF5722',
                  color: '#FF5722',
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: 2,
                  width: '100%',
                  '&:hover': {
                    borderColor: '#E64A19',
                    color: '#E64A19',
                    bgcolor: 'rgba(255, 87, 34, 0.05)',
                  },
                  transition: 'all 300ms ease-in-out',
                }}
              >
                {isLoading ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
            <Divider sx={{ width: '100%', display: { xs: 'block', md: 'none' } }} />
            
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  color: '#112D4E', 
                  fontWeight: 600,
                  fontFamily: "'Montserrat', sans-serif",
                  mb: 3
                }}
              >
                Account Information
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {currentUser?.displayName || 'Not provided'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {currentUser?.email || 'Not provided'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Account Created</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {currentUser?.metadata.creationTime 
                      ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Unknown'
                    }
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Last Sign In</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {currentUser?.metadata.lastSignInTime
                      ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Unknown'
                    }
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                color: '#112D4E', 
                fontWeight: 600,
                fontFamily: "'Montserrat', sans-serif",
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box position="relative" display="inline-flex" mr={0.5}>
                <WavesIcon sx={{ color: '#3F72AF' }} />
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  sx={{ transform: 'translate(-50%, -50%)' }}
                >
                  <FavoriteIcon fontSize="small" sx={{ color: '#FF7E67' }} />
                </Box>
              </Box> 
              Your Gratitude Impact
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3,
                mb: 2
              }}
            >
              <Card 
                className="kindness-card" 
                sx={{ 
                  flex: 1, 
                  borderRadius: 3,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.07)',
                  borderTop: '2px solid #3F72AF',
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <QrCodeIcon sx={{ fontSize: 40, color: '#3F72AF', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3F72AF' }}>
                    {userQrCodes.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#515151', mt: 1 }}>
                    QR Codes Created
                  </Typography>
                </CardContent>
              </Card>
              
              <Card 
                className="kindness-card" 
                sx={{ 
                  flex: 1, 
                  borderRadius: 3,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.07)',
                  borderTop: '2px solid #4CAF50',
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <FavoriteIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                    {userQrCodes.reduce((total, qrCode) => total + qrCode.scanCount, 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#515151', mt: 1 }}>
                    Thank Yous Received
                  </Typography>
                </CardContent>
              </Card>
              
              <Card 
                className="kindness-card" 
                sx={{ 
                  flex: 1, 
                  borderRadius: 3,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.07)',
                  borderTop: '2px solid #FF7E67',
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <PublicIcon sx={{ fontSize: 40, color: '#FF7E67', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF7E67' }}>
                    {(() => {
                      // Get all unique countries across all QR codes
                      const uniqueCountries = new Set<string>();
                      
                      userQrCodes.forEach(qrCode => {
                        qrCode.scans.forEach(scan => {
                          if (scan.location.country) {
                            uniqueCountries.add(scan.location.country);
                          }
                        });
                      });
                      
                      return uniqueCountries.size;
                    })()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#515151', mt: 1 }}>
                    Countries Reached
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/create')}
                startIcon={<QrCodeIcon />}
                sx={{
                  py: 1.5,
                  px: 3,
                  mb: 3,
                  bgcolor: '#3F72AF',
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: '#112D4E',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 300ms ease-in-out',
                }}
              >
                Create New QR Code
              </Button>
            </Box>
            
            {/* QR Codes List */}
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  color: '#112D4E', 
                  fontWeight: 600,
                  fontFamily: "'Montserrat', sans-serif",
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                Your QR Codes
              </Typography>
              
              {isLoadingQrCodes ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : userQrCodes.length === 0 ? (
                <Paper 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    bgcolor: '#f5f5f5',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    You haven't created any QR codes yet.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Click "Create New QR Code" to get started.
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                  {userQrCodes.map((qrCode) => (
                    <Paper
                      key={qrCode.id}
                      sx={{
                        p: 3,
                        mb: 2,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2,
                        '&:hover': {
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Code: {qrCode.code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Created: {new Date(qrCode.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Scans: {qrCode.scanCount}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
                        <Button
                          variant="outlined"
                          size="small"
                          component={Link}
                          to={`/stats/${qrCode.code}`}
                          sx={{ minWidth: '80px' }}
                        >
                          Stats
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          component={Link}
                          to={`/create?edit=${qrCode.code}`}
                          sx={{ 
                            minWidth: '80px',
                            color: '#4CAF50',
                            borderColor: '#4CAF50',
                            '&:hover': {
                              borderColor: '#3d8c40',
                              backgroundColor: 'rgba(76, 175, 80, 0.04)',
                            }
                          }}
                        >
                          Print
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;