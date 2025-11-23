import { supabase } from '../lib/supabase';

export type CustomerType = 'professional' | 'individual';

interface PricingRate {
  id: string;
  customer_type: CustomerType;
  distance_min_km: number;
  distance_max_km: number | null;
  rate_per_km: number;
  is_active: boolean;
}

let cachedRates: PricingRate[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

const FALLBACK_RATES = {
  professional: [
    { min: 0, max: 40, rate: 3.50 },
    { min: 41, max: 90, rate: 1.82 },
    { min: 91, max: null, rate: 1.26 },
  ],
  individual: [
    { min: 0, max: 40, rate: 4.20 },
    { min: 41, max: 90, rate: 2.20 },
    { min: 91, max: null, rate: 1.51 },
  ],
};

async function fetchPricingRates(): Promise<PricingRate[]> {
  const now = Date.now();

  if (cachedRates && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    const { data, error } = await supabase
      .from('pricing_rates')
      .select('*')
      .eq('is_active', true)
      .order('customer_type', { ascending: true })
      .order('distance_min_km', { ascending: true });

    if (error) throw error;

    cachedRates = data || [];
    lastFetchTime = now;
    return cachedRates;
  } catch (error) {
    console.error('Error fetching pricing rates:', error);
    return [];
  }
}

function findRateForDistance(
  rates: PricingRate[],
  distanceKm: number,
  customerType: CustomerType
): number {
  const customerRates = rates.filter(r => r.customer_type === customerType);

  for (const rate of customerRates) {
    const inRange = distanceKm >= rate.distance_min_km &&
                    (rate.distance_max_km === null || distanceKm <= rate.distance_max_km);
    if (inRange) {
      return rate.rate_per_km;
    }
  }

  const fallbackRates = FALLBACK_RATES[customerType];
  for (const rate of fallbackRates) {
    const inRange = distanceKm >= rate.min &&
                    (rate.max === null || distanceKm <= rate.max);
    if (inRange) {
      return rate.rate;
    }
  }

  return customerType === 'professional' ? 1.26 : 1.51;
}

export async function calculatePrice(
  distanceKm: number,
  customerType: CustomerType
): Promise<number> {
  const rates = await fetchPricingRates();
  const rate = findRateForDistance(rates, distanceKm, customerType);
  const price = distanceKm * rate;
  return Math.round(price * 100) / 100;
}

export function calculatePriceSync(
  distanceKm: number,
  customerType: CustomerType
): number {
  if (cachedRates && cachedRates.length > 0) {
    const rate = findRateForDistance(cachedRates, distanceKm, customerType);
    const price = distanceKm * rate;
    return Math.round(price * 100) / 100;
  }

  const fallbackRates = FALLBACK_RATES[customerType];
  for (const rate of fallbackRates) {
    const inRange = distanceKm >= rate.min &&
                    (rate.max === null || distanceKm <= rate.max);
    if (inRange) {
      const price = distanceKm * rate.rate;
      return Math.round(price * 100) / 100;
    }
  }

  const defaultRate = customerType === 'professional' ? 1.26 : 1.51;
  return Math.round(distanceKm * defaultRate * 100) / 100;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}
