import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Login from '../Login'
import * as authContext from '../../contexts/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ 
      state: null,
      pathname: '/login',
      search: '',
      hash: '',
      key: 'default'
    })
  }
})

describe('Login Component', () => {
  // Mock auth functions
  const mockSignIn = vi.fn().mockResolvedValue({ user: null, error: null })
  const mockSignInWithGoogle = vi.fn().mockResolvedValue({ user: null, error: null })
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock the useAuth hook
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      currentUser: null,
      isLoading: false,
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithGoogle: mockSignInWithGoogle,
    })
  })
  
  it('calls signIn function with credentials', async () => {
    // Setup user event
    const user = userEvent.setup()
    
    // Mock successful login
    mockSignIn.mockResolvedValue({ user: { uid: '123' }, error: null })
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    
    // Get form elements (using more reliable queries)
    const emailInput = screen.getByRole('textbox', { name: /email/i }) // or use getAllByRole and find the one
    const passwordInput = screen.getByLabelText(/password/i) // or use more specific selector
    const submitButton = screen.getByRole('button', { name: /sign in$/i })
    
    // Fill form and submit
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    // Verify signin was called with correct params
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    
    // Verify navigation happened
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })
  
  it('shows error message when login fails', async () => {
    // Setup user event
    const user = userEvent.setup()
    
    // Mock failed login
    mockSignIn.mockResolvedValue({ user: null, error: new Error('Invalid credentials') })
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    
    // Get form elements
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in$/i })
    
    // Fill form and submit
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    // Verify error message is shown
    expect(await screen.findByText('Invalid email or password. Please try again.')).toBeInTheDocument()
  })
  
  it('calls signInWithGoogle when clicking Google login button', async () => {
    // Setup user event
    const user = userEvent.setup()
    
    // Mock successful Google login
    mockSignInWithGoogle.mockResolvedValue({ user: { uid: '123' }, error: null })
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    
    // Find Google button and click it
    const googleButton = screen.getByRole('button', { name: /sign in with google/i })
    await user.click(googleButton)
    
    // Verify Google sign in was called
    expect(mockSignInWithGoogle).toHaveBeenCalled()
    
    // Verify navigation happened
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })
})