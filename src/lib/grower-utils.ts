/**
 * Utility functions for grower-related operations
 * Maps product grower names to grower IDs for navigation
 */

// Map of normalized grower names (from products) to grower IDs
const GROWER_NAME_TO_ID: Record<string, number> = {
  fungifreshfarms: 1,
  themushroomatchbukidnon: 2,
  kabutehannialingnena: 3,
  shroomarket: 4,
  kingfarms: 1, // Fallback to Fungi Fresh Farms for now
};

/**
 * Convert a product's grower name to the corresponding grower ID
 * @param growerName - The grower name from product data (e.g., "FungiFreshFarms")
 * @returns The grower ID, or null if no match found
 */
export function getGrowerIdFromName(growerName: string): number | null {
  const normalized = growerName.toLowerCase().replace(/[^a-z]/g, "");
  return GROWER_NAME_TO_ID[normalized] ?? null;
}

/**
 * Get the grower profile URL from a product's grower name
 * @param growerName - The grower name from product data
 * @returns URL path to grower profile, or fallback to directory
 */
export function getGrowerUrl(growerName: string): string {
  const growerId = getGrowerIdFromName(growerName);
  return growerId ? `/grower/${growerId}` : "/grower";
}
