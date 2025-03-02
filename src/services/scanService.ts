import Cookies from 'js-cookie'

/**
 * Generate a consistent ID for the current browser/device.
 * This helps deduplicate scan events from the same user.
 */
export const getOrCreateUserId = (): string => {
  const USER_ID_COOKIE = 'thank_you_qr_visitor_id'
  
  // Try to get existing user ID
  let userId = Cookies.get(USER_ID_COOKIE)
  
  // If no user ID exists, create a new one
  if (!userId) {
    userId = crypto.randomUUID()
    
    // Save the user ID in a cookie (2 year expiration)
    Cookies.set(USER_ID_COOKIE, userId, {
      expires: 730, // 2 years in days
      sameSite: 'Lax'
    })
  }
  
  return userId
}

/**
 * Check if the user has scanned a specific QR code before
 * @param qrId QR code ID
 * @returns Whether this is a new scan for this user
 */
export const isFirstScanForUser = (qrId: string): boolean => {
  const cookieName = `qr_scanned_${qrId}`
  return Cookies.get(cookieName) !== 'true'
}

/**
 * Mark that this user has scanned a specific QR code
 * @param qrId QR code ID
 */
export const markQrAsScanned = (qrId: string): void => {
  const cookieName = `qr_scanned_${qrId}`
  Cookies.set(cookieName, 'true', {
    expires: 365, // 1 year
    sameSite: 'Lax'
  })
}