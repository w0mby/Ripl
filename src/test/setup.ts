import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// For Vitest, the matchers get added automatically when importing @testing-library/jest-dom

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock matchMedia which is not available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock firebase
vi.mock('firebase/app', () => {
  return {
    initializeApp: vi.fn().mockReturnValue({}),
  }
})

vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn().mockReturnValue({}),
  }
})

vi.mock('firebase/auth', () => {
  return {
    getAuth: vi.fn().mockReturnValue({}),
    GoogleAuthProvider: vi.fn().mockImplementation(() => ({})),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    updateProfile: vi.fn(),
    onAuthStateChanged: vi.fn(),
  }
})

// Mock mapbox-gl to avoid issues with transform stream which isn't available in jsdom
vi.mock('mapbox-gl', () => ({
  default: {},
  Map: vi.fn(() => ({
    on: vi.fn(),
    remove: vi.fn(),
  })),
}))

// Mock react-map-gl 
vi.mock('react-map-gl', () => ({
  Map: vi.fn().mockImplementation(({ children }) => {
    return { type: 'div', props: { 'data-testid': 'mock-map-gl', children } }
  }),
  Marker: vi.fn().mockImplementation(({ children }) => {
    return { type: 'div', props: { 'data-testid': 'mock-marker', children } }
  }),
  Popup: vi.fn().mockImplementation(({ children }) => {
    return { type: 'div', props: { 'data-testid': 'mock-popup', children } }
  }),
}))