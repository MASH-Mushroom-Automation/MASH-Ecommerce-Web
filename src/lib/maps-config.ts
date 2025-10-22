// Google Maps Configuration
export const MAPS_CONFIG = {
  // You'll need to get this from Google Cloud Console
  // https://console.cloud.google.com/apis/credentials
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",

  // Map options
  defaultCenter: {
    lat: 14.5995, // Manila coordinates
    lng: 120.9842,
  },

  defaultZoom: 13,

  // Map styling
  mapOptions: {
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    mapTypeControl: false,
  },

  // Required APIs
  libraries: ["places", "geometry"] as const,
};

// Check if Google Maps is properly configured
// For now, we'll use the iframe approach, so this returns false to use the embedded map
export const isMapsConfigured = () => {
  // Set to true if you want to use the full Google Maps API
  // Set to false to use the embedded iframe (current default)
  return false; // !!MAPS_CONFIG.apiKey && MAPS_CONFIG.apiKey !== "";
};
