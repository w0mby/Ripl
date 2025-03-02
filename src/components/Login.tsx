import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Divider, 
  Stack,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const Login: React.FC = () => {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to home
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        // Redirect to the page they were trying to access
        navigate(from, { replace: true });
      }
    } catch (error) {
      setError('Failed to sign in. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signInWithGoogle();
      
      if (result.error) {
        setError('Failed to sign in with Google. Please try again.');
      } else {
        // Redirect to the page they were trying to access
        navigate(from, { replace: true });
      }
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
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
                mb: 1,
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              <FavoriteIcon sx={{ color: '#FF7E67' }} /> Sign In
            </Typography>
            <Typography 
              variant="body1" 
              color="textSecondary"
              sx={{ 
                fontFamily: "'Roboto', sans-serif",
                color: '#515151',
              }}
            >
              Sign in to create and share your gratitude
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleEmailLogin}>
            <Stack spacing={3}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLoading}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
              
              <TextField
                label="Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
                InputProps={{
                  sx: { borderRadius: 2 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                sx={{
                  py: 1.5,
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
                Sign In
              </Button>
            </Stack>
          </form>

          <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
            <Divider sx={{ flexGrow: 1 }} />
            <Typography variant="body2" sx={{ px: 2, color: '#515151' }}>
              OR
            </Typography>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>

          <Button
            variant="outlined"
            fullWidth
            onClick={handleGoogleLogin}
            disabled={isLoading}
            startIcon={<GoogleIcon />}
            sx={{
              py: 1.5,
              borderColor: '#3F72AF',
              color: '#3F72AF',
              fontFamily: "'Roboto', sans-serif",
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                borderColor: '#112D4E',
                color: '#112D4E',
                bgcolor: 'rgba(63, 114, 175, 0.05)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 300ms ease-in-out',
            }}
          >
            Sign in with Google
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              color="textSecondary"
              sx={{ 
                fontFamily: "'Roboto', sans-serif",
                color: '#515151',
              }}
            >
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: '#3F72AF', 
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;