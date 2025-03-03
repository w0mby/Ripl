import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  Paper,
  Stack,
  useScrollTrigger,
  Slide
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import WavesIcon from '@mui/icons-material/Waves'
import QrCodeIcon from '@mui/icons-material/QrCode'
import HomeIcon from '@mui/icons-material/Home'
import PublicIcon from '@mui/icons-material/Public'
import PersonIcon from '@mui/icons-material/Person'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import './App.css'
import QrGenerator from './components/QrGenerator'
import QrScanner from './components/QrScanner'
import QrStats from './components/QrStats'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import GlobalMap from './components/GlobalMap'
import MapPage from './components/MapPage'

function App() {
  // Define Header component inside App to avoidcontext issues
  // Header component with scroll behavior
  interface HeaderProps {
    children: React.ReactElement;
  }

  function HideOnScroll(props: HeaderProps) {
    const { children } = props;
    const trigger = useScrollTrigger({
      threshold: 100,
    });

    return (
      <Slide appear={false} direction="down" in={!trigger}>
        {children}
      </Slide>
    );
  }

  // Context-aware header component that will be used inside AuthProvider
  function AdaptiveHeader() {
    const [scrolled, setScrolled] = useState(false);
    const { currentUser } = useAuth();

    // Track if user has scrolled down
    useEffect(() => {
      const handleScroll = () => {
        setScrolled(window.scrollY > 20);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Check if we're on a detail page (scan result)
    // const isDetailPage = location.pathname.includes('/scan/');

    return (
      <HideOnScroll>
        <AppBar
          position="sticky"
          elevation={scrolled ? 2 : 0}
          sx={{
            background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            borderBottom: scrolled ? 'none' : '1px solid rgba(63, 114, 175, 0.1)',
            transition: 'all 300ms ease-in-out',
            height: scrolled ? { xs: '54px', md: '60px' } : { xs: '64px', md: '72px' }
          }}
        >
          <Toolbar
            sx={{
              px: { xs: 2, sm: 4 },
              minHeight: '0 !important',
              height: '100%'
            }}
          >
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: '#112D4E',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexGrow: 1,
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                transition: 'all 300ms ease-in-out',
                transform: scrolled ? 'scale(0.95)' : 'scale(1)'
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
              Ripl.io
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 1, sm: 2 },
                alignItems: 'center'
              }}
            >
              <Button
                component={Link}
                to="/"
                startIcon={<HomeIcon />}
                sx={{
                  color: '#3F72AF',
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '1rem',
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                Home
              </Button>

              <Button
                component={Link}
                to="/map"
                startIcon={<PublicIcon />}
                sx={{
                  color: '#3F72AF',
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '1rem',
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                Global Map
              </Button>

              {currentUser ? (
                <>
                  <Button
                    component={Link}
                    to="/profile"
                    sx={{
                      color: '#3F72AF',
                      fontWeight: 500,
                      textTransform: 'none',
                      fontSize: '1rem',
                      display: { xs: 'none', sm: 'flex' }
                    }}
                  >
                    My Profile
                  </Button>

                  <Button
                    variant="contained"
                    component={Link}
                    to="/create"
                    disableElevation
                    startIcon={<QrCodeIcon />}
                    sx={{
                      bgcolor: '#3F72AF',
                      color: 'white',
                      fontWeight: 500,
                      textTransform: 'none',
                      borderRadius: 4,
                      px: { xs: 2, sm: 3 },
                      display: { xs: 'none', sm: 'flex' },
                      '&:hover': {
                        bgcolor: '#112D4E',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                      },
                      transition: 'all 300ms ease-in-out'
                    }}
                  >
                    Create Link
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    sx={{
                      color: '#3F72AF',
                      fontWeight: 500,
                      textTransform: 'none',
                      fontSize: '1rem',
                      display: { xs: 'none', sm: 'flex' }
                    }}
                  >
                    Sign In
                  </Button>

                  <Button
                    variant="contained"
                    component={Link}
                    to="/register"
                    disableElevation
                    sx={{
                      bgcolor: '#3F72AF',
                      color: 'white',
                      fontWeight: 500,
                      textTransform: 'none',
                      borderRadius: 4,
                      px: { xs: 2, sm: 3 },
                      display: { xs: 'none', sm: 'flex' },
                      '&:hover': {
                        bgcolor: '#112D4E',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                      },
                      transition: 'all 300ms ease-in-out'
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
    );
  }

  // Mobile Bottom Navigation Component to be used inside AuthProvider
  function MobileNavigation() {
    const location = useLocation();
    const { currentUser } = useAuth();

    return (
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: 'flex', sm: 'none' },
          zIndex: 100,
          borderTop: '1px solid rgba(63, 114, 175, 0.1)',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
          height: '56px',
          justifyContent: 'space-around',
          alignItems: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)'
        }}
        elevation={0}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: location.pathname === '/' ? '#3F72AF' : '#515151',
              transition: 'all 300ms ease'
            }}
          >
            <HomeIcon fontSize="small" />
            <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>Home</Typography>
          </Box>
        </Link>

        <Link to="/map" style={{ textDecoration: 'none' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: location.pathname === '/map' ? '#3F72AF' : '#515151',
              transition: 'all 300ms ease'
            }}
          >
            <PublicIcon fontSize="small" />
            <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>Map</Typography>
          </Box>
        </Link>

        {currentUser ? (
          <>
            <Link to="/create" style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: location.pathname === '/create' ? '#3F72AF' : '#515151',
                  transition: 'all 300ms ease'
                }}
              >
                <QrCodeIcon fontSize="small" />
                <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>New Link</Typography>
              </Box>
            </Link>

            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: location.pathname === '/profile' ? '#3F72AF' : '#515151',
                  transition: 'all 300ms ease'
                }}
              >
                <PersonIcon fontSize="small" />
                <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>Profile</Typography>
              </Box>
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: location.pathname === '/login' ? '#3F72AF' : '#515151',
                  transition: 'all 300ms ease'
                }}
              >
                <LoginIcon fontSize="small" />
                <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>Sign In</Typography>
              </Box>
            </Link>

            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: location.pathname === '/register' ? '#3F72AF' : '#515151',
                  transition: 'all 300ms ease'
                }}
              >
                <PersonAddIcon fontSize="small" />
                <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>Sign Up</Typography>
              </Box>
            </Link>
          </>
        )}

      </Paper>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}>
          {/* App Bar with scroll behavior */}
          <AdaptiveHeader />

          {/* Main Content */}
          <Container
            component="main"
            sx={{
              flexGrow: 1,
              py: { xs: 2, sm: 4 },
              px: { xs: 1, sm: 2, md: 3 },
              pb: { xs: 8, sm: 4 }, // Extra padding at bottom for mobile navigation
              maxWidth: '100%'
            }}
          >
            <Routes>
              <Route path="/" element={
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {/* Hero Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      py: 6,
                      px: 3,
                      textAlign: 'center',
                      backgroundColor: 'transparent',
                      background: 'linear-gradient(120deg, #DBE2EF 0%, #FFFFFF 100%)',
                      borderRadius: 8,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      opacity: 0.05,
                      backgroundImage: 'url("/world-map-dots.png")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      zIndex: 0
                    }} />

                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography
                        variant="h2"
                        component="h1"
                        gutterBottom
                        className="gradient-text"
                        sx={{
                          fontWeight: 'bold',
                          mb: 3,
                          fontSize: { xs: '2rem', md: '2.75rem' },
                          fontFamily: "'Montserrat', sans-serif"
                        }}
                      >
                        Ripples of Kindness
                      </Typography>

                      <Typography
                        variant="h5"
                        sx={{
                          maxWidth: 800,
                          mx: 'auto',
                          mb: 4,
                          color: '#112D4E',
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 600
                        }}
                      >
                        Create a ripple effect of gratitude that spans continents, connects hearts, and builds a global community of kindness.
                      </Typography>

                      <Typography
                        variant="body1"
                        paragraph
                        sx={{
                          maxWidth: 700,
                          mx: 'auto',
                          mb: 5,
                          color: '#515151',
                          fontFamily: "'Roboto', sans-serif"
                        }}
                      >
                        Just like ripples in water, acts of kindness multiply when shared. Each thank you creates a chain reaction,
                        connecting people across the globe in an ever-expanding network of gratitude and warmth.
                      </Typography>

                      <Button
                        variant="contained"
                        size="large"
                        component={Link}
                        to="/create"
                        startIcon={<FavoriteIcon />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: 4,
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          bgcolor: '#3F72AF',
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: '#112D4E',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
                            color: 'white',
                            '& .MuiSvgIcon-root': {
                              color: '#FF7E67'
                            }
                          },
                          '&:focus': {
                            color: 'white',
                            '& .MuiSvgIcon-root': {
                              color: '#FF7E67'
                            }
                          },
                          transition: 'all 300ms ease-in-out'
                        }}
                      >
                        Create Your Ripple
                      </Button>
                    </Box>
                  </Paper>

                  {/* World Map Section - Hidden on mobile */}
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 4,
                        borderRadius: 8,
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <Typography
                        variant="h4"
                        component="h2"
                        gutterBottom
                        sx={{
                          textAlign: 'center',
                          mb: 3,
                          color: '#112D4E',
                          fontWeight: 600,
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: { xs: '1.5rem', md: '2rem' }
                        }}
                      >
                        Ripl.io Global Impact
                      </Typography>

                      <Typography
                        variant="body1"
                        paragraph
                        sx={{
                          maxWidth: 800,
                          mx: 'auto',
                          mb: 4,
                          textAlign: 'center',
                          color: '#515151',
                          fontFamily: "'Roboto', sans-serif"
                        }}
                      >
                        Every colored point represents a ripple of kindness where someone has shared or received a
                        thank you message. Watch how these ripples connect across countries, cultures, and continents.
                      </Typography>

                      <Box sx={{
                        height: 400,
                        width: '100%',
                        borderRadius: 8,
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <GlobalMap />
                        {/* Call-to-action button removed from desktop version */}
                      </Box>
                    </Paper>
                  </Box>

                  {/* Mobile CTA - Only shown on mobile */}
                  <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 4 }}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 4,
                        borderRadius: 8,
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                      }}
                    >
                      <Typography
                        variant="h5"
                        component="h2"
                        gutterBottom
                        sx={{
                          mb: 2,
                          color: '#112D4E',
                          fontWeight: 600,
                          fontFamily: "'Montserrat', sans-serif"
                        }}
                      >
                        Ripl.io Global Impact
                      </Typography>

                      <Typography
                        variant="body1"
                        paragraph
                        sx={{
                          mb: 3,
                          color: '#515151',
                          fontFamily: "'Roboto', sans-serif"
                        }}
                      >
                        Every colored point on our map represents a ripple of kindness. Join the movement and see your impact spread globally.
                      </Typography>

                      <Button
                        variant="contained"
                        component={Link}
                        to="/create"
                        fullWidth
                        startIcon={<FavoriteIcon />}
                        sx={{
                          py: 1.5,
                          borderRadius: 4,
                          bgcolor: '#4CAF50',
                          color: 'white',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: '#3d8c40',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)'
                          },
                          transition: 'all 300ms ease-in-out'
                        }}
                      >
                        Start Your Ripple
                      </Button>
                    </Paper>
                  </Box>

                  {/* Kindness Facts Section */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    justifyContent: 'space-between',
                    mb: 4
                  }}>
                    <Paper
                      elevation={1}
                      className="kindness-card"
                      sx={{
                        p: 3,
                        flex: 1,
                        textAlign: 'center',
                        borderRadius: 8,
                        borderTop: '2px solid #3F72AF',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <Typography variant="h6" gutterBottom sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        color: '#112D4E'
                      }}>
                        Ripples Expand
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "'Roboto', sans-serif", color: '#515151' }}>
                        A small act of gratitude expands outward, touching an
                        ever-increasing number of lives, just like ripples in water.
                      </Typography>
                    </Paper>

                    <Paper
                      elevation={1}
                      className="kindness-card"
                      sx={{
                        p: 3,
                        flex: 1,
                        textAlign: 'center',
                        borderRadius: 8,
                        borderTop: '2px solid #4CAF50',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <Typography variant="h6" gutterBottom sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        color: '#112D4E'
                      }}>
                        Connection
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "'Roboto', sans-serif", color: '#515151' }}>
                        Each 'thank you' creates a human connection,
                        transcending geographical and cultural differences.
                      </Typography>
                    </Paper>

                    <Paper
                      elevation={1}
                      className="kindness-card"
                      sx={{
                        p: 3,
                        flex: 1,
                        textAlign: 'center',
                        borderRadius: 8,
                        borderTop: '2px solid #FF7E67',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <Typography variant="h6" gutterBottom sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        color: '#112D4E'
                      }}>
                        Global Impact
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "'Roboto', sans-serif", color: '#515151', mb: 2 }}>
                        See how your gratitude joins thousands of others,
                        creating a worldwide web of appreciation.
                      </Typography>
                      <Button
                        component={Link}
                        to="/map"
                        variant="outlined"
                        startIcon={<PublicIcon />}
                        size="small"
                        sx={{
                          color: '#3F72AF',
                          borderColor: '#3F72AF',
                          textTransform: 'none',
                          fontSize: '0.85rem',
                          '&:hover': {
                            borderColor: '#112D4E',
                            backgroundColor: 'rgba(63, 114, 175, 0.05)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 300ms ease-in-out'
                        }}
                      >
                        Explore Global Map
                      </Button>
                    </Paper>
                  </Box>
                </Box>
              } />

              {/* Protected route for QR creation */}
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <QrGenerator />
                  </ProtectedRoute>
                }
              />

              {/* Public routes */}
              <Route path="/r/:qrId" element={<QrScanner />} />
              <Route path="/stats/:qrId" element={<QrStats />} />

              {/* Map page route */}
              <Route path="/map" element={<MapPage />} />

              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Container>

          {/* Mobile Bottom Navigation */}
          <MobileNavigation />

          {/* Footer */}
          <Box
            component="footer"
            sx={{
              py: 3,
              backgroundColor: '#F8F9FA',
              borderTop: '1px solid rgba(63, 114, 175, 0.1)',
              textAlign: 'center',
              mt: 'auto',
              display: { xs: 'none', sm: 'block' } // Hide on mobile due to bottom nav
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              alignItems="center"
              sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}
            >
              <Typography
                variant="body2"
                color="#515151"
                sx={{
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <span>
                  &copy; {new Date().getFullYear()} Ripl.io - Creating ripples of kindness globally
                  <Box component="span" position="relative" display="inline-flex" ml={0.5} sx={{ verticalAlign: 'middle' }}>
                    <WavesIcon fontSize="small" sx={{ color: '#3F72AF' }} />
                    <Box
                      component="span"
                      position="absolute"
                      top="50%"
                      left="50%"
                      sx={{ transform: 'translate(-50%, -50%)' }}
                    >
                      <FavoriteIcon fontSize="inherit" sx={{ color: '#FF7E67', fontSize: '10px' }} />
                    </Box>
                  </Box>
                </span>
              </Typography>
            </Stack>
          </Box>
        </Box>
      </AuthProvider>
    </Router>
  )
}

export default App
