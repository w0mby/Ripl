import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import QrGenerator from '../QrGenerator'
import * as qrCodeService from '../../services/qrCodeService'
import * as authContext from '../../contexts/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import { User } from 'firebase/auth'

// Basic mocks needed for the component to render
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('mock-data-url'),
  }),
}))

vi.mock('react-qr-code', () => ({
  default: () => <div data-testid="qr-code">QR Code</div>,
}))

// Simple mock for URLSearchParams
global.URLSearchParams = vi.fn().mockImplementation(() => ({
  get: vi.fn().mockReturnValue(null),
}))

describe('QrGenerator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock current user
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      currentUser: { 
        uid: 'test-user-id',
        emailVerified: false,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: vi.fn(),
        getIdToken: vi.fn(),
        getIdTokenResult: vi.fn(),
        reload: vi.fn(),
        toJSON: vi.fn()
      } as unknown as User,
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithGoogle: vi.fn(),
    })
  })
  
  it('calls generateQrCode when button is clicked', async () => {
    // Mock the QR code generation service
    const mockGenerateQrCode = vi.spyOn(qrCodeService, 'generateQrCode')
      .mockResolvedValue({
        id: 'test-qr-id',
        code: 'ABC123'
      })
    
    render(
      <MemoryRouter>
        <QrGenerator />
      </MemoryRouter>
    )
    
    // Find generate button (using a more reliable query)
    const generateButton = screen.getByRole('button', { name: /generate/i })
    
    // Click it using fireEvent (more reliable than userEvent for this test)
    fireEvent.click(generateButton)
    
    // Check service was called with correct user ID
    expect(mockGenerateQrCode).toHaveBeenCalledWith('test-user-id')
    
    // Wait for results to appear (this confirms the async flow works)
    await waitFor(() => {
      expect(screen.getByText('ABC123')).toBeInTheDocument()
    })
  })
})