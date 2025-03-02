import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from '../ProtectedRoute'
import * as authContext from '../../contexts/AuthContext'
import { MemoryRouter } from 'react-router-dom'

// Create a mock for Navigate component
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => ({
      pathname: '/protected-page',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    }),
    Navigate: (props) => {
      mockNavigate(props.to, props.state, props.replace)
      return null
    },
  }
})

// Test component to include in the ProtectedRoute
const TestComponent = () => <div data-testid="protected-content">Protected Content</div>

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('renders children when user is authenticated', () => {
    // Mock authenticated user
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      currentUser: { uid: '123', email: 'test@example.com' },
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithGoogle: vi.fn(),
    })
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )
    
    // Protected content should be rendered
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
  
  it('redirects to login when user is not authenticated', () => {
    // Mock unauthenticated user
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      currentUser: null,
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithGoogle: vi.fn(),
    })
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )
    
    // Protected content should not be rendered
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    
    // Navigate should be called with the right arguments
    expect(mockNavigate).toHaveBeenCalled()
    expect(mockNavigate.mock.lastCall[0]).toBe('/login')
  })
})