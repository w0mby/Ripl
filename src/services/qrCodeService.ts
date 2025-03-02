import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  setDoc,
  increment,
  query,
  where,
  collection,
  getDocs
} from 'firebase/firestore'
import Cookies from 'js-cookie'
import { db } from '../firebase'
import { QrCodeStats, ScanRecord } from '../types'

const QR_COLLECTION = 'qrCodes'

/**
 * Generate a random 6-character alphanumeric code (lowercase only)
 */
const generateShortCode = (): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  let result = '';
  
  // Create a Uint32Array of the required length
  const randomValues = new Uint32Array(length);
  
  // Fill with random values
  crypto.getRandomValues(randomValues);
  
  // Use these values to pick characters from our set
  for (let i = 0; i < length; i++) {
    result += characters.charAt(randomValues[i] % characters.length);
  }
  
  return result;
};

/**
 * Check if a short code already exists in the database
 */
const isCodeUnique = async (code: string): Promise<boolean> => {
  try {
    const q = query(collection(db, QR_COLLECTION), where("code", "==", code));
    const querySnapshot = await getDocs(q);
    
    // If the query returns documents, the code is not unique
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking code uniqueness:', error);
    // In case of error, we'll retry with another code
    return false;
  }
};

/**
 * Generate a unique short code that doesn't exist in the database
 */
const generateUniqueShortCode = async (): Promise<string> => {
  let maxAttempts = 10;
  let code = '';
  let isUnique = false;
  
  // Retry a few times if we get collisions
  while (!isUnique && maxAttempts > 0) {
    code = generateShortCode();
    isUnique = await isCodeUnique(code);
    maxAttempts--;
  }
  
  if (!isUnique) {
    // If we still don't have a unique code after max attempts,
    // something is wrong (or we're incredibly unlucky)
    throw new Error('Failed to generate a unique code after multiple attempts');
  }
  
  return code;
};

export const generateQrCode = async (userId?: string): Promise<{ id: string, code: string }> => {
  try {
    // Generate a unique ID for the QR code
    const id = crypto.randomUUID();
    
    // Generate a unique 6-character code
    const code = await generateUniqueShortCode();
    
    console.log('Creating QR code with ID:', id, 'and code:', code);
    
    // Create a new QR code record in Firestore
    await setDoc(doc(db, QR_COLLECTION, id), {
      id,
      code,
      scanCount: 0,
      scans: [],
      createdAt: Date.now(),
      ...(userId ? { createdBy: userId } : {}) // Add user ID if provided
    });
    
    console.log('QR code created successfully');
    return { id, code };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Get QR code ID from short code
 * 
 * @param code - 6-character alphanumeric code
 * @returns The QR code ID or null if not found
 */
export const getQrIdFromCode = async (code: string): Promise<string | null> => {
  try {
    if (code.length !== 6) {
      return null;
    }
    
    const q = query(collection(db, QR_COLLECTION), where("code", "==", code));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting QR ID from code:', error);
    return null;
  }
};

/**
 * Get QR code stats by ID (UUID) or code (6-char alphanumeric)
 * 
 * @param idOrCode - Either the QR code's UUID or its 6-character code
 * @returns The QR code statistics or null if not found
 */
export const getQrCodeStats = async (idOrCode: string): Promise<QrCodeStats | null> => {
  try {
    // First try direct lookup by ID (UUID) which is fastest
    const docRef = doc(db, QR_COLLECTION, idOrCode);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as QrCodeStats;
    }
    
    // If not found by ID, it might be a short code
    // Only run this query if the string is exactly 6 characters
    if (idOrCode.length === 6) {
      const q = query(collection(db, QR_COLLECTION), where("code", "==", idOrCode));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // We found the document with this code
        return querySnapshot.docs[0].data() as QrCodeStats;
      }
    }
    
    // Not found by either method
    return null;
  } catch (error) {
    console.error('Error getting QR code stats:', error);
    return null;
  }
}

/**
 * Check if user has already scanned this QR code using cookies
 * @param qrId The ID of the QR code
 * @returns boolean indicating if this is a new scan
 */
const isNewScan = (qrId: string): boolean => {
  // Create a unique cookie name for this QR code
  const cookieName = `qr_scanned_${qrId}`

  // Check if the cookie exists (user has scanned this QR code before)
  const existingCookie = Cookies.get(cookieName)

  console.log('QR service checking cookie for', qrId, ':', existingCookie)

  // Only check cookie, don't set it (to avoid double cookie setting)
  if (existingCookie) {
    // User has scanned this QR code before
    console.log('Already scanned, not incrementing counter')
    return false
  } else {
    // First time scanning this QR code
    console.log('First-time scan, incrementing counter')
    return true
  }
}

/**
 * Record a scan event in Firestore
 *
 * Records location and time of scan, and increments counter if this is a new visitor.
 * We record scan history (locations) for every scan, but only count unique visitors once.
 *
 * @param qrId QR code identifier
 * @param latitude Scan location latitude
 * @param longitude Scan location longitude
 * @param city Optional city name
 * @param country Optional country name
 * @param isFirstScan Optional flag to directly control whether to count as new scan
 * @param userId Optional user identifier to prevent duplicate scans
 * @returns Promise resolving to success status
 */
/**
 * Get QR codes created by a specific user
 * 
 * @param userId - The user ID to filter by
 * @returns Array of QR code statistics
 */
export const getUserQrCodes = async (userId: string): Promise<QrCodeStats[]> => {
  try {
    const q = query(collection(db, QR_COLLECTION), where("createdBy", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const results: QrCodeStats[] = [];
    querySnapshot.forEach((doc) => {
      results.push(doc.data() as QrCodeStats);
    });
    
    // Sort by creation date (newest first)
    return results.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting user QR codes:', error);
    return [];
  }
};

export const recordScan = async (
  qrId: string,
  latitude: number,
  longitude: number,
  city?: string,
  country?: string,
  isFirstScan?: boolean, // Optional parameter for directly controlling scan count
  userId?: string // Optional user ID to track who made the scan
): Promise<boolean> => {
  try {
    const docRef = doc(db, QR_COLLECTION, qrId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return false
    }

    // Get the current QR code data
    const currentData = docSnap.data() as QrCodeStats
    const currentScans = currentData.scans || []
    const currentTimestamp = Date.now()

    // Check for duplicate scans within 1 second
    const isDuplicate = currentScans.some(scan => {
      const timeDiff = Math.abs(scan.timestamp - currentTimestamp)
      const isSameUser = scan.userId === userId

      // Consider it a duplicate if:
      // 1. Scanned within 1 second, AND
      // 2. Same user (if userId is provided)
      return timeDiff < 1000 && (userId ? isSameUser : true)
    })

    if (isDuplicate) {
      console.log('Duplicate scan detected (within 1 second) - ignoring')
      return true // Return success but don't record the scan
    }

    // Create scan record with proper data validation to prevent undefined values
    const scanRecord: ScanRecord = {
      id: crypto.randomUUID(),
      qrId,
      timestamp: currentTimestamp,
      ...(userId ? { userId } : {}), // Include user ID if provided
      location: {
        latitude: latitude || 0,
        longitude: longitude || 0,
        // Only include city and country if they are defined
        ...(city ? { city } : {}),
        ...(country ? { country } : {})
      }
    }

    console.log('Created scan record:', JSON.stringify(scanRecord))

    // Always record the scan in the array for location tracking
    // But only increment the counter if this is a new scan for this user

    // If isFirstScan was provided directly, use that value
    // Otherwise fall back to the cookie check
    const shouldIncrementCounter = isFirstScan !== undefined
      ? isFirstScan
      : isNewScan(qrId)

    console.log('Should increment counter?', shouldIncrementCounter ? 'YES' : 'NO')
    console.log('Current scan count:', currentData.scanCount)

    try {
      // First, add the scan to the array - all scans are recorded
      console.log('Adding scan to history array')
      await updateDoc(docRef, {
        scans: arrayUnion(scanRecord)
      })
      console.log('Added scan to array successfully')

      // Then, if needed, increment the counter separately
      if (shouldIncrementCounter) {
        // Only for new scans - increment the counter
        console.log('Incrementing unique visitor counter')
        await updateDoc(docRef, {
          scanCount: increment(1)
        })
        console.log('Updated counter successfully')
      } else {
        console.log('Not incrementing counter for returning visitor')
      }
    } catch (err) {
      console.error('Error updating Firestore:', err)
      // Rethrow so caller can handle
      throw err
    }

    return true
  } catch (error) {
    console.error('Error recording scan:', error)
    return false
  }
}
