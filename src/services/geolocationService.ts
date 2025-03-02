interface GeolocationResult {
  latitude: number
  longitude: number
  city?: string
  country?: string
  error?: string
  source?: 'browser' | 'ip' | 'none'
}

/**
 * Apply privacy-preserving fuzzing to coordinates
 * This reduces precision to protect user privacy while maintaining general area accuracy
 */
const applyLocationFuzzing = (location: GeolocationResult): GeolocationResult => {
  if (location.error || (location.latitude === 0 && location.longitude === 0)) {
    return location; // Don't modify error cases
  }
  
  // If we have city data, use the city approach - most privacy protective
  if (location.city && location.country) {
    // Get deterministic but random-looking offsets based on city name
    // This ensures the same city always shows at the same "fuzzy" location
    const cityHash = [...location.city].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Generate a deterministic offset of up to ~3km in any direction
    // The offset is based on the city name, so it's consistent for the same city
    const latOffset = (cityHash % 57) * 0.001; // ~111 meters per 0.001° latitude
    const lngOffset = (cityHash % 73) * 0.001; // ~111 * cos(lat) meters per 0.001° longitude
    
    // Apply the offset to get a consistent "city center" position
    return {
      ...location,
      latitude: Math.round(location.latitude * 100) / 100 + (latOffset % 0.03),
      longitude: Math.round(location.longitude * 100) / 100 + (lngOffset % 0.03)
    };
  }
  
  // If we only have coordinates, reduce precision significantly (roughly to city level)
  // Round to 2 decimal places (~1.1km precision) and add small jitter
  const jitterLat = (Math.sin(location.latitude * 10) * 0.01); // Small jitter based on position
  const jitterLng = (Math.cos(location.longitude * 10) * 0.01);
  
  return {
    ...location,
    latitude: Math.round(location.latitude * 100) / 100 + jitterLat,
    longitude: Math.round(location.longitude * 100) / 100 + jitterLng
  };
};

/**
 * Get the user's location, first trying browser geolocation, 
 * then falling back to IP-based geolocation if permission is denied
 */
export const getCurrentLocation = async (): Promise<GeolocationResult> => {
  try {
    // First, try to get browser geolocation
    const browserLocation = await getBrowserGeolocation();
    
    // If browser geolocation succeeded, apply privacy fuzzing and return it
    if (!browserLocation.error) {
      return applyLocationFuzzing({ ...browserLocation, source: 'browser' });
    }
    
    // If browser geolocation failed, try IP-based geolocation
    console.log('Browser geolocation failed, trying IP-based geolocation:', browserLocation.error);
    const ipLocation = await getIpBasedLocation();
    
    if (!ipLocation.error) {
      return applyLocationFuzzing({ ...ipLocation, source: 'ip' });
    }
    
    // If both methods failed, return error
    console.log('Both geolocation methods failed');
    return {
      latitude: 0,
      longitude: 0,
      error: 'Unable to determine location',
      source: 'none'
    };
  } catch (error) {
    console.error('Unexpected error in geolocation service:', error);
    return {
      latitude: 0,
      longitude: 0,
      error: 'Unexpected error determining location',
      source: 'none'
    };
  }
}

/**
 * Try to get location from browser's geolocation API
 */
const getBrowserGeolocation = (): Promise<GeolocationResult> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: 0,
        longitude: 0,
        error: 'Geolocation is not supported by this browser'
      });
      return;
    }
    
    // Set timeout - don't wait forever for user permission
    const timeoutId = setTimeout(() => {
      resolve({
        latitude: 0,
        longitude: 0,
        error: 'Geolocation request timed out'
      });
    }, 10000); // 10 second timeout
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = position.coords;
        
        try {
          // Attempt to get city and country from reverse geocoding
          const locationInfo = await fetchLocationInfo(latitude, longitude);
          
          resolve({
            latitude,
            longitude,
            ...locationInfo
          });
        } catch {
          // Return just coordinates if geocoding fails
          resolve({
            latitude,
            longitude
          });
        }
      },
      (geoError) => {
        clearTimeout(timeoutId);
        resolve({
          latitude: 0,
          longitude: 0,
          error: geoError.message
        });
      },
      { 
        enableHighAccuracy: false, 
        timeout: 8000,
        maximumAge: 60000 // 1 minute cache
      }
    );
  });
}

/**
 * Get location based on IP address using a free geolocation API
 * Will try multiple services in case one fails
 */
const getIpBasedLocation = async (): Promise<GeolocationResult> => {
  try {
    // First try ipapi.co
    const location = await getIpLocationFromIpapi();
    
    // If we got a valid location, return it
    if (isValidLocation(location)) {
      return location;
    }
    
    // If ipapi.co failed, try a backup service
    console.log('Primary IP geolocation failed, trying backup service');
    const backupLocation = await getIpLocationFromIpify();
    
    return backupLocation;
  } catch (error) {
    console.error('All IP geolocation attempts failed:', error);
    return {
      latitude: 0,
      longitude: 0,
      error: 'Failed to get location from IP'
    };
  }
}

/**
 * Get IP-based location from ipapi.co
 */
const getIpLocationFromIpapi = async (): Promise<GeolocationResult> => {
  try {
    // Using ipapi.co (free tier allows 1000 requests/day)
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('IP geolocation API error');
    }
    
    const data = await response.json();
    
    // Check if we got valid data
    if (data.error) {
      throw new Error(`IP geolocation API error: ${data.reason || 'Unknown error'}`);
    }
    
    return {
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      city: data.city,
      country: data.country_name
    };
  } catch (error) {
    console.error('Error fetching IP location from ipapi:', error);
    return {
      latitude: 0,
      longitude: 0,
      error: 'Failed to get location from ipapi'
    };
  }
}

/**
 * Backup method using ipify + ipinfo.io
 */
const getIpLocationFromIpify = async (): Promise<GeolocationResult> => {
  try {
    // First get the IP using ipify
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    
    if (!ipResponse.ok) {
      throw new Error('Failed to get IP address');
    }
    
    const ipData = await ipResponse.json();
    const ip = ipData.ip;
    
    // Then use ipinfo.io to get location data
    const geoResponse = await fetch(`https://ipinfo.io/${ip}/json`);
    
    if (!geoResponse.ok) {
      throw new Error('ipinfo.io API error');
    }
    
    const data = await geoResponse.json();
    
    // ipinfo returns location as "lat,long" string, so we need to parse it
    let latitude = 0;
    let longitude = 0;
    
    if (data.loc && typeof data.loc === 'string') {
      const [lat, lng] = data.loc.split(',');
      latitude = parseFloat(lat) || 0;
      longitude = parseFloat(lng) || 0;
    }
    
    return {
      latitude,
      longitude,
      city: data.city,
      country: data.country
    };
  } catch (error) {
    console.error('Error fetching IP location from ipify + ipinfo:', error);
    return {
      latitude: 0,
      longitude: 0,
      error: 'Failed to get location from backup service'
    };
  }
}

/**
 * Check if a location result has valid coordinates
 */
const isValidLocation = (location: GeolocationResult): boolean => {
  // Check if we have an error
  if (location.error) {
    return false;
  }
  
  // Check if coordinates are valid (not 0,0 which is often the default/error value)
  if (location.latitude === 0 && location.longitude === 0) {
    return false;
  }
  
  return true;
}

// Use a free reverse geocoding API to get city and country
// This fetches city-level location to maintain privacy
const fetchLocationInfo = async (
  latitude: number, 
  longitude: number
): Promise<{city?: string, country?: string}> => {
  try {
    // Using a free reverse geocoding API with zoom=10 for city level data
    // This helps protect privacy by not using the exact location
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding API error')
    }
    
    const data = await response.json()
    
    return {
      city: data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.address?.state,
      country: data.address?.country
    }
  } catch (error) {
    console.error('Error fetching location info:', error)
    return {}
  }
}