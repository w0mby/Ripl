import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../AuthContext'

// Mock the firebase module
vi.mock('../../firebase', () => ({
  auth: {
    currentUser: null
  },
  signInWithGoogle: vi.fn().mockResolvedValue({ user: null, error: null }),
  signUp: vi.fn().mockResolvedValue({ user: null, error: null }),
  signIn: vi.fn().mockResolvedValue({ user: null, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null })
}))

// Mock onAuthStateChanged to avoid async issues
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null)
    return vi.fn() // Return unsubscribe
  }),
  getAuth: vi.fn()
}))

// Test component that uses auth context
const TestComponent = () => {
  const { currentUser, signIn, signUp, signOut, signInWithGoogle } = useAuth()
  
  return (
    <div>
      <div data-testid="auth-status">
        {currentUser ? 'User is signed in' : 'No user'}
      </div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password', 'Test User')}>Sign Up</button>
      <button onClick={() => signOut()}>Sign Out</button>
      <button onClick={() => signInWithGoogle()}>Sign In with Google</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('provides authentication context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Check that the auth status is displayed
    expect(screen.getByTestId('auth-status')).toHaveTextContent('No user')
  })
  
  it('calls the signIn function from context', async () => {
    const { signIn } = await import('../../firebase')
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Click the sign in button
    await userEvent.click(screen.getByText('Sign In'))
    
    // Check if signIn was called with the right arguments
    expect(signIn).toHaveBeenCalledWith('test@example.com', 'password')
  })
  
  it('calls the signUp function from context', async () => {
    const { signUp } = await import('../../firebase')
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Click the sign up button
    await userEvent.click(screen.getByText('Sign Up'))
    
    // Check if signUp was called with the right arguments
    expect(signUp).toHaveBeenCalledWith('test@example.com', 'password', 'Test User')
  })
  
  it('calls the signOut function from context', async () => {
    const { signOut } = await import('../../firebase')
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Click the sign out button
    await userEvent.click(screen.getByText('Sign Out'))
    
    // Check if signOut was called
    expect(signOut).toHaveBeenCalled()
  })
  
  it('calls the signInWithGoogle function from context', async () => {
    const { signInWithGoogle } = await import('../../firebase')
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Click the Google sign in button
    await userEvent.click(screen.getByText('Sign In with Google'))
    
    // Check if signInWithGoogle was called
    expect(signInWithGoogle).toHaveBeenCalled()
  })
})