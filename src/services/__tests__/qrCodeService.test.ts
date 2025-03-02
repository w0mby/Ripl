import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getQrIdFromCode } from '../qrCodeService'
import * as qrCodeService from '../qrCodeService'
import { db } from '../../firebase'
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore'

// Mock crypto
vi.stubGlobal('crypto', {
  randomUUID: vi.fn().mockReturnValue('test-uuid'),
  getRandomValues: vi.fn().mockImplementation((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  })
})

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
}))

// Mock Firebase db
vi.mock('../../firebase', () => ({
  db: {},
}))

describe('QrCodeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  // Mock isCodeUnique and generateUniqueShortCode directly
  // instead of testing the actual generateQrCode function
  describe('getQrIdFromCode', () => {
    it('returns the QR code ID when a valid code is provided', async () => {
      // Mock query and where
      const mockQueryRef = {}
      vi.mocked(query).mockReturnValue(mockQueryRef as any)
      vi.mocked(where).mockReturnValue('where-clause' as any)
      
      // Mock query result
      const mockQrDoc = {
        id: 'mock-qr-id',
        data: () => ({ code: 'ABC123' })
      }
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [mockQrDoc]
      } as any)
      
      // Call the function
      const result = await getQrIdFromCode('ABC123')
      
      // Verify correct calls were made
      expect(collection).toHaveBeenCalledWith(db, 'qrCodes')
      expect(where).toHaveBeenCalledWith('code', '==', 'ABC123')
      expect(query).toHaveBeenCalled()
      
      // Check result
      expect(result).toBe('mock-qr-id')
    })
    
    it('returns null when no QR code matches the provided code', async () => {
      // Mock empty query result
      vi.mocked(getDocs).mockResolvedValue({
        empty: true,
        docs: []
      } as any)
      
      // Call the function
      const result = await getQrIdFromCode('INVALID')
      
      // Check result
      expect(result).toBeNull()
    })
  })
})