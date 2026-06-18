import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/geocode/search?q=... — forward geocode (place search) via OSM
// Nominatim. Proxied server-side to set the required User-Agent and bias
// results toward Maharashtra / India. Used by the report form's pin search.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  // viewbox biases (not restricts) results to Maharashtra: lon/lat corners.
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2` +
    `&q=${encodeURIComponent(q)}` +
    `&countrycodes=in&limit=6&addressdetails=0&accept-language=mr,en` +
    `&viewbox=72.6,22.1,80.9,15.6&bounded=0`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "OpenWellSafety/1.0 (civic-tech hazard reporting)",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return NextResponse.json({ results: [] });

    const data = (await res.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
    }>;

    const results = data.map((d) => ({
      display_name: d.display_name,
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
