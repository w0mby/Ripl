import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const Register: React.FC = () => {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signUp(email, password, name);
      
      if (result.error) {
        const errorMessage = (result.error as { code?: string })?.code === 'auth/email-already-in-use' 
          ? 'Email already in use. Please try a different email or sign in.' 
          : 'Failed to create account. Please try again.';
        setError(errorMessage);
      } else {
        // Registration successful, redirect to home
        navigate('/');
      }
    } catch (error) {
      setError('Failed to create account. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signInWithGoogle();
      
      if (result.error) {
        setError('Failed to sign up with Google. Please try again.');
      } else {
        // Google sign-up successful, redirect to home
        navigate('/');
      }
    } catch (error) {
      setError('Failed to sign up with Google. Please try again.');
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
              <FavoriteIcon sx={{ color: '#FF7E67' }} /> Create Account
            </Typography>
            <Typography 
              variant="body1" 
              color="textSecondary"
              sx={{ 
                fontFamily: "'Roboto', sans-serif",
                color: '#515151',
              }}
            >
              Join the global gratitude movement
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleRegister}>
            <Stack spacing={3}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={isLoading}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
              
              <TextField
                label="Email"
                variant="outlined"
                type="email"
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
                autoComplete="new-password"
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
              
              <TextField
                label="Confirm Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isLoading}
                InputProps={{
                  sx: { borderRadius: 2 }
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
                Create Account
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
            onClick={handleGoogleSignUp}
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
            Sign up with Google
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
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#3F72AF', 
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;