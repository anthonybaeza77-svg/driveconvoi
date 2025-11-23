export interface Coordinates {
  lat: number;
  lng: number;
}

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'ConvoyageApp/1.0'
        }
      }
    );

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
    Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export async function calculateDistanceBetweenAddresses(
  address1: string,
  address2: string
): Promise<number | null> {
  const [coord1, coord2] = await Promise.all([
    geocodeAddress(address1),
    geocodeAddress(address2)
  ]);

  if (!coord1 || !coord2) {
    return null;
  }

  return calculateDistance(coord1, coord2);
}
