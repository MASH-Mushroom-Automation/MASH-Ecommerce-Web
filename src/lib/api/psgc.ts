/**
 * PSGC API Service
 * Philippine Standard Geographic Code API
 * Base URL: https://psgc.gitlab.io/api/
 */

const PSGC_BASE_URL = "https://psgc.gitlab.io/api";

export interface PSGCRegion {
  code: string;
  name: string;
  regionName?: string;
  islandGroupCode?: string;
  psgc10DigitCode?: string;
}

export interface PSGCProvince {
  code: string;
  name: string;
  regionCode: string;
  islandGroupCode?: string;
  psgc10DigitCode?: string;
}

export interface PSGCCity {
  code: string;
  name: string;
  oldName?: string;
  isCapital?: boolean;
  districtCode?: string;
  provinceCode?: string;
  regionCode?: string;
  islandGroupCode?: string;
  psgc10DigitCode?: string;
}

export interface PSGCBarangay {
  code: string;
  name: string;
  oldName?: string;
  subMunicipalityCode?: string;
  cityCode?: string;
  municipalityCode?: string;
  districtCode?: string;
  provinceCode?: string;
  regionCode?: string;
  islandGroupCode?: string;
  psgc10DigitCode?: string;
}

/**
 * Fetch all regions
 * Using local data for reliability
 */
export async function fetchRegions(): Promise<PSGCRegion[]> {
  console.log("[PSGC] Loading regions from local data");
  // Return local data immediately for better performance and reliability
  const regions = getFallbackRegions();
  console.log("[PSGC] Regions loaded:", regions.length);
  return Promise.resolve(regions);
}

/**
 * Fetch all cities/municipalities
 * Using local data for reliability
 */
export async function fetchCitiesMunicipalities(): Promise<PSGCCity[]> {
  console.log("[PSGC] Loading cities from local data");
  const cities = getFallbackCities();
  console.log("[PSGC] Cities loaded:", cities.length);
  return Promise.resolve(cities);
}

/**
 * Fetch all barangays
 * Using local data for reliability
 */
export async function fetchBarangays(): Promise<PSGCBarangay[]> {
  console.log("[PSGC] Loading barangays from local data");
  const barangays = getFallbackBarangays();
  console.log("[PSGC] Barangays loaded:", barangays.length);
  return Promise.resolve(barangays);
}

/**
 * Filter cities by region code
 */
export function filterCitiesByRegion(
  cities: PSGCCity[],
  regionCode: string
): PSGCCity[] {
  return cities.filter((city) => city.regionCode === regionCode);
}

/**
 * Filter barangays by city code
 */
export function filterBarangaysByCity(
  barangays: PSGCBarangay[],
  cityCode: string
): PSGCBarangay[] {
  return barangays.filter(
    (barangay) =>
      barangay.cityCode === cityCode || barangay.municipalityCode === cityCode
  );
}

/**
 * Local Philippine regions data
 */
function getFallbackRegions(): PSGCRegion[] {
  return [
    { code: "130000000", name: "NCR - National Capital Region" },
    { code: "140000000", name: "CAR - Cordillera Administrative Region" },
    { code: "010000000", name: "Region I - Ilocos Region" },
    { code: "020000000", name: "Region II - Cagayan Valley" },
    { code: "030000000", name: "Region III - Central Luzon" },
    { code: "040000000", name: "Region IV-A - CALABARZON" },
    { code: "170000000", name: "Region IV-B - MIMAROPA" },
    { code: "050000000", name: "Region V - Bicol Region" },
    { code: "060000000", name: "Region VI - Western Visayas" },
    { code: "070000000", name: "Region VII - Central Visayas" },
    { code: "080000000", name: "Region VIII - Eastern Visayas" },
    { code: "090000000", name: "Region IX - Zamboanga Peninsula" },
    { code: "100000000", name: "Region X - Northern Mindanao" },
    { code: "110000000", name: "Region XI - Davao Region" },
    { code: "120000000", name: "Region XII - SOCCSKSARGEN" },
    { code: "160000000", name: "Region XIII - Caraga" },
    { code: "150000000", name: "BARMM - Bangsamoro Autonomous Region in Muslim Mindanao" },
  ];
}

/**
 * Local Philippine cities/municipalities data
 */
function getFallbackCities(): PSGCCity[] {
  return [
    // NCR Cities
    { code: "137400000", name: "Manila", regionCode: "130000000" },
    { code: "137404000", name: "Quezon City", regionCode: "130000000" },
    { code: "137401000", name: "Caloocan", regionCode: "130000000" },
    { code: "137402000", name: "Las Piñas", regionCode: "130000000" },
    { code: "137403000", name: "Makati", regionCode: "130000000" },
    { code: "137405000", name: "Malabon", regionCode: "130000000" },
    { code: "137406000", name: "Mandaluyong", regionCode: "130000000" },
    { code: "137407000", name: "Marikina", regionCode: "130000000" },
    { code: "137408000", name: "Muntinlupa", regionCode: "130000000" },
    { code: "137409000", name: "Navotas", regionCode: "130000000" },
    { code: "137410000", name: "Parañaque", regionCode: "130000000" },
    { code: "137411000", name: "Pasay", regionCode: "130000000" },
    { code: "137412000", name: "Pasig", regionCode: "130000000" },
    { code: "137413000", name: "Pateros", regionCode: "130000000" },
    { code: "137414000", name: "San Juan", regionCode: "130000000" },
    { code: "137415000", name: "Taguig", regionCode: "130000000" },
    { code: "137416000", name: "Valenzuela", regionCode: "130000000" },
    
    // Region III - Central Luzon
    { code: "034500000", name: "Angeles City", regionCode: "030000000" },
    { code: "034501000", name: "San Fernando", regionCode: "030000000" },
    { code: "034502000", name: "Mabalacat", regionCode: "030000000" },
    { code: "034503000", name: "Olongapo City", regionCode: "030000000" },
    { code: "034504000", name: "Balanga", regionCode: "030000000" },
    { code: "034505000", name: "Cabanatuan", regionCode: "030000000" },
    
    // Region IV-A - CALABARZON
    { code: "043400000", name: "Calamba", regionCode: "040000000" },
    { code: "043401000", name: "Santa Rosa", regionCode: "040000000" },
    { code: "043402000", name: "Biñan", regionCode: "040000000" },
    { code: "043403000", name: "San Pedro", regionCode: "040000000" },
    { code: "043404000", name: "Antipolo", regionCode: "040000000" },
    { code: "043405000", name: "Bacoor", regionCode: "040000000" },
    { code: "043406000", name: "Dasmariñas", regionCode: "040000000" },
    { code: "043407000", name: "Imus", regionCode: "040000000" },
    { code: "043408000", name: "Lipa", regionCode: "040000000" },
    { code: "043409000", name: "Batangas City", regionCode: "040000000" },
    
    // Region VII - Central Visayas
    { code: "072200000", name: "Cebu City", regionCode: "070000000" },
    { code: "072201000", name: "Mandaue", regionCode: "070000000" },
    { code: "072202000", name: "Lapu-Lapu", regionCode: "070000000" },
    { code: "072203000", name: "Talisay", regionCode: "070000000" },
    { code: "072204000", name: "Tagbilaran", regionCode: "070000000" },
    
    // Region XI - Davao Region
    { code: "112400000", name: "Davao City", regionCode: "110000000" },
    { code: "112401000", name: "Tagum", regionCode: "110000000" },
    { code: "112402000", name: "Panabo", regionCode: "110000000" },
    { code: "112403000", name: "Digos", regionCode: "110000000" },
  ];
}

/**
 * Local Philippine barangays data (sample for major cities)
 */
function getFallbackBarangays(): PSGCBarangay[] {
  return [
    // Quezon City Barangays
    { code: "137404001", name: "Alicia", cityCode: "137404000" },
    { code: "137404002", name: "Bagong Pag-asa", cityCode: "137404000" },
    { code: "137404003", name: "Bahay Toro", cityCode: "137404000" },
    { code: "137404004", name: "Balingasa", cityCode: "137404000" },
    { code: "137404005", name: "Batasan Hills", cityCode: "137404000" },
    { code: "137404006", name: "Commonwealth", cityCode: "137404000" },
    { code: "137404007", name: "Cubao", cityCode: "137404000" },
    { code: "137404008", name: "Diliman", cityCode: "137404000" },
    { code: "137404009", name: "Fairview", cityCode: "137404000" },
    { code: "137404010", name: "Kamuning", cityCode: "137404000" },
    { code: "137404011", name: "Novaliches", cityCode: "137404000" },
    { code: "137404012", name: "Project 4", cityCode: "137404000" },
    { code: "137404013", name: "Project 6", cityCode: "137404000" },
    { code: "137404014", name: "Project 8", cityCode: "137404000" },
    { code: "137404015", name: "San Bartolome", cityCode: "137404000" },
    { code: "137404016", name: "Tandang Sora", cityCode: "137404000" },
    
    // Manila Barangays
    { code: "137400001", name: "Ermita", cityCode: "137400000" },
    { code: "137400002", name: "Intramuros", cityCode: "137400000" },
    { code: "137400003", name: "Malate", cityCode: "137400000" },
    { code: "137400004", name: "Paco", cityCode: "137400000" },
    { code: "137400005", name: "Pandacan", cityCode: "137400000" },
    { code: "137400006", name: "Port Area", cityCode: "137400000" },
    { code: "137400007", name: "Quiapo", cityCode: "137400000" },
    { code: "137400008", name: "Sampaloc", cityCode: "137400000" },
    { code: "137400009", name: "San Miguel", cityCode: "137400000" },
    { code: "137400010", name: "Santa Ana", cityCode: "137400000" },
    { code: "137400011", name: "Santa Cruz", cityCode: "137400000" },
    { code: "137400012", name: "Tondo", cityCode: "137400000" },
    
    // Makati Barangays
    { code: "137403001", name: "Bel-Air", cityCode: "137403000" },
    { code: "137403002", name: "Poblacion", cityCode: "137403000" },
    { code: "137403003", name: "San Lorenzo", cityCode: "137403000" },
    { code: "137403004", name: "Salcedo Village", cityCode: "137403000" },
    { code: "137403005", name: "Urdaneta", cityCode: "137403000" },
    { code: "137403006", name: "Valenzuela", cityCode: "137403000" },
    
    // Taguig Barangays
    { code: "137415001", name: "Bagumbayan", cityCode: "137415000" },
    { code: "137415002", name: "Bonifacio Global City", cityCode: "137415000" },
    { code: "137415003", name: "Fort Bonifacio", cityCode: "137415000" },
    { code: "137415004", name: "Hagonoy", cityCode: "137415000" },
    { code: "137415005", name: "Maharlika Village", cityCode: "137415000" },
    { code: "137415006", name: "Pinagsama", cityCode: "137415000" },
    { code: "137415007", name: "Signal Village", cityCode: "137415000" },
    { code: "137415008", name: "Tanyag", cityCode: "137415000" },
    { code: "137415009", name: "Upper Bicutan", cityCode: "137415000" },
    { code: "137415010", name: "Western Bicutan", cityCode: "137415000" },

    { code: "137401001", name: "Barangay 178", cityCode: "137401000" },
{ code: "137401002", name: "Barangay 175", cityCode: "137401000" },
{ code: "137401003", name: "Barangay 177", cityCode: "137401000" },
{ code: "137401004", name: "Barangay 176", cityCode: "137401000" },
{ code: "137401005", name: "Barangay 174", cityCode: "137401000" },
{ code: "137401006", name: "Barangay 173", cityCode: "137401000" },
{ code: "137401007", name: "Barangay 172", cityCode: "137401000" },
{ code: "137401008", name: "Barangay 171", cityCode: "137401000" },
{ code: "137401009", name: "Barangay 170", cityCode: "137401000" },
{ code: "137401010", name: "Barangay 169", cityCode: "137401000" },
  ];
}
