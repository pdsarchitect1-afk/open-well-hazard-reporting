import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/geocode?lat=..&lng=.. — reverse geocode via OSM Nominatim.
// Proxied server-side so we can set the required User-Agent header and keep
// the citizen's browser from hitting Nominatim directly (usage policy).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  // Request English place names so district/taluka align with our English
  // DISTRICT_CODES (used for the MH-XXX report ID) and the map filter dropdown.
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}` +
    `&zoom=14&accept-language=en`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "OpenWellSafety/1.0 (civic-tech hazard reporting)",
      },
      // light caching to respect Nominatim's usage policy
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ address: {} });
    }

    const data = await res.json();
    const a = data.address ?? {};

    // Map Nominatim fields to our address shape (best-effort).
    const district =
      a.state_district || a.county || a.district || a.city_district || "";
    const taluka =
      a.county || a.municipality || a.suburb || a.city_district || "";
    const village =
      a.village || a.town || a.hamlet || a.suburb || a.city || a.neighbourhood || "";

    return NextResponse.json({
      address: {
        district: cleanSuffix(district, "District|Division"),
        taluka: cleanSuffix(taluka, "Taluka|Tehsil|Tahsil"),
        village,
        pin: a.postcode || "",
        road: a.road || "",
      },
      displayName: data.display_name || "",
    });
  } catch {
    return NextResponse.json({ address: {} });
  }
}

// Nominatim often returns "Pune District" / "Haveli Taluka" — strip the suffix
// so the value matches our DISTRICT_CODES keys and the map filter dropdown.
function cleanSuffix(value: string, suffixes: string): string {
  return value.replace(new RegExp(`\\s+(${suffixes})$`, "i"), "").trim();
}
