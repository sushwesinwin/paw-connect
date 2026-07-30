import { getListings, PetListing } from "@/lib/api";

export async function getLostFoundPosts(): Promise<PetListing[]> {
  try {
    const listings = await getListings();
    return listings.filter((listing) => listing.type !== "ADOPTION");
  } catch {
    return [];
  }
}
