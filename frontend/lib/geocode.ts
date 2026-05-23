import { API_URL } from "@/lib/api";

/** Geocode via backend proxy (avoids Nominatim CORS in the browser). */
export async function geocodeQuery(
  query: string,
): Promise<{ lat: number; lng: number } | null> {
  if (!query.trim()) return null;
  try {
    const res = await fetch(
      `${API_URL}/api/geocode?${new URLSearchParams({ q: query.trim() })}`,
      { cache: "no-store" },
    );
    if (res.ok) {
      const data = await res.json();
      const lat = Number(data.lat);
      const lng = Number(data.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng };
      }
    }
  } catch {
    /* fall through */
  }
  return null;
}

export function isValidCoord(lat: number, lng: number) {
  return (
    Math.abs(lat) > 0.01 && Math.abs(lng) > 0.01 && !(lat === 0 && lng === 0)
  );
}
