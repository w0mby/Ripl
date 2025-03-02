import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAE-GxUUusu_W0-YgRv55f4Hl9CBZf3Uik",
  authDomain: "orleans-39b46.firebaseapp.com",
  projectId: "orleans-39b46",
  storageBucket: "orleans-39b46.appspot.com",
  messagingSenderId: "517321009158",
  appId: "1:517321009158:web:307edcf00929f1b83f7b87",
  measurementId: "G-KFSTT58ZH3"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return { user: result.user, error: null }
  } catch (error) {
    console.error('Error signing in with Google:', error)
    return { user: null, error: error as Error }
  }
}

export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName })
    return { user: userCredential.user, error: null }
  } catch (error) {
    console.error('Error signing up:', error)
    return { user: null, error: error as Error }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error) {
    console.error('Error signing in:', error)
    return { user: null, error: error as Error }
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error) {
    console.error('Error signing out:', error)
    return { error: error as Error }
  }
}

// Connect to emulator in development if needed
// if (window.location.hostname === 'localhost') {
//   connectFirestoreEmulator(db, 'localhost', 8080)
// }

// For debugging
console.log('Firebase initialized with project:', firebaseConfig.projectId)
