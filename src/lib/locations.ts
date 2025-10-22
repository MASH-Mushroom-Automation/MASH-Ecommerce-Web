// Simple Philippine location data

export interface Region {
  code: string;
  name: string;
}

export interface City {
  code: string;
  name: string;
  regionCode: string;
  provinceName: string;
  postalCode?: string;
}

export interface Barangay {
  code: string;
  name: string;
  cityCode: string;
}

// Sample regions
export const REGIONS: Region[] = [
  { code: "NCR", name: "National Capital Region" },
  { code: "REGION_III", name: "Central Luzon" },
  { code: "REGION_IV_A", name: "CALABARZON" },
  { code: "REGION_VII", name: "Central Visayas" },
  { code: "REGION_XI", name: "Davao Region" },
];

// Sample cities
export const CITIES: City[] = [
  // NCR Cities
  {
    code: "QUEZON_CITY",
    name: "Quezon City",
    regionCode: "NCR",
    provinceName: "Metro Manila",
    postalCode: "1100",
  },
  {
    code: "MANILA",
    name: "Manila",
    regionCode: "NCR",
    provinceName: "Metro Manila",
    postalCode: "1000",
  },
  {
    code: "MAKATI",
    name: "Makati",
    regionCode: "NCR",
    provinceName: "Metro Manila",
    postalCode: "1200",
  },
  {
    code: "TAGUIG",
    name: "Taguig",
    regionCode: "NCR",
    provinceName: "Metro Manila",
    postalCode: "1630",
  },

  // Region III Cities
  {
    code: "ANGELES_CITY",
    name: "Angeles City",
    regionCode: "REGION_III",
    provinceName: "Pampanga",
    postalCode: "2009",
  },
  {
    code: "SAN_FERNANDO",
    name: "San Fernando",
    regionCode: "REGION_III",
    provinceName: "Pampanga",
    postalCode: "2000",
  },
  {
    code: "OLONGAPO",
    name: "Olongapo",
    regionCode: "REGION_III",
    provinceName: "Zambales",
    postalCode: "2200",
  },

  // Region IV-A Cities
  {
    code: "CALAMBA",
    name: "Calamba",
    regionCode: "REGION_IV_A",
    provinceName: "Laguna",
    postalCode: "4027",
  },
  {
    code: "SANTA_ROSA",
    name: "Santa Rosa",
    regionCode: "REGION_IV_A",
    provinceName: "Laguna",
    postalCode: "4026",
  },
  {
    code: "ANTIPOLO",
    name: "Antipolo",
    regionCode: "REGION_IV_A",
    provinceName: "Rizal",
    postalCode: "1870",
  },
];

// Sample barangays
export const BARANGAYS: Barangay[] = [
  // Quezon City Barangays
  { code: "QC_DILIMAN", name: "Diliman", cityCode: "QUEZON_CITY" },
  { code: "QC_CUBAO", name: "Cubao", cityCode: "QUEZON_CITY" },
  { code: "QC_KAMUNING", name: "Kamuning", cityCode: "QUEZON_CITY" },
  { code: "QC_EAST_KAMIAS", name: "East Kamias", cityCode: "QUEZON_CITY" },

  // Manila Barangays
  { code: "MNL_ERMITA", name: "Ermita", cityCode: "MANILA" },
  { code: "MNL_MALATE", name: "Malate", cityCode: "MANILA" },
  { code: "MNL_INTRAMUROS", name: "Intramuros", cityCode: "MANILA" },

  // Makati Barangays
  { code: "MKT_AYALA", name: "Ayala", cityCode: "MAKATI" },
  { code: "MKT_BEL_AIR", name: "Bel-Air", cityCode: "MAKATI" },
  { code: "MKT_SALCEDO", name: "Salcedo Village", cityCode: "MAKATI" },

  // Taguig Barangays
  { code: "TAG_BGC", name: "Bonifacio Global City", cityCode: "TAGUIG" },
  { code: "TAG_FORT_BONIFACIO", name: "Fort Bonifacio", cityCode: "TAGUIG" },

  // Angeles City Barangays
  { code: "AC_BALIBAGO", name: "Balibago", cityCode: "ANGELES_CITY" },
  { code: "AC_CLARK", name: "Clark", cityCode: "ANGELES_CITY" },

  // Calamba Barangays
  { code: "CAL_POBLACION", name: "Poblacion", cityCode: "CALAMBA" },
  { code: "CAL_MAYAPA", name: "Mayapa", cityCode: "CALAMBA" },
];

// Helper functions
export function getRegions(): Region[] {
  return REGIONS;
}

export function getCitiesByRegion(regionCode: string): City[] {
  return CITIES.filter((city) => city.regionCode === regionCode);
}

export function getBarangaysByCity(
  regionCode: string,
  cityCode: string
): Barangay[] {
  return BARANGAYS.filter((barangay) => barangay.cityCode === cityCode);
}

export function getRegionByCode(code: string): Region | undefined {
  return REGIONS.find((region) => region.code === code);
}

export function getCityByCode(code: string): City | undefined {
  return CITIES.find((city) => city.code === code);
}

export function getBarangayByCode(code: string): Barangay | undefined {
  return BARANGAYS.find((barangay) => barangay.code === code);
}
