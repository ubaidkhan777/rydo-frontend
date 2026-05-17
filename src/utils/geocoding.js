// Utility to resolve geographical coordinates into human-readable addresses
export const reverseGeocode = async (lat, lng) => {
  const API_KEY = import.meta.env.VITE_GEOCODING_API_KEY;
  
  // Fallback if no API key is provided
  if (!API_KEY || API_KEY === 'your_google_maps_api_key_here') {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      // Return the most relevant formatted address
      return data.results[0].formatted_address;
    } else {
      console.warn('Geocoding API warning:', data.status, data.error_message || '');
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  } catch (error) {
    console.error('Failed to fetch address:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};
