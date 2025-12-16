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
export const isMapsConfigured = () => {
  // Returns true if the API key is set
  return !!MAPS_CONFIG.apiKey && MAPS_CONFIG.apiKey !== "";
};
