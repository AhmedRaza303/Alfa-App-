/**
 * Online production image URLs for campaign flyers.
 * Stable, high-quality marketing creatives hosted on HTTPS CDN with public access and CORS support.
 *
 * 1. AUTUMN_PROMO_URL: Autumn Horizon brand refresh flyer
 * 2. PRODUCT_LAUNCH_URL: Next-generation product release spotlight flyer
 * 3. EVENT_SUMMIT_URL: Executive B2B digital roadmap & webinar flyer
 * 4. PROMO_SALE_URL: Flash discount voucher & VIP early access flyer
 */
export const ONLINE_FLYER_URLS = {
  // Autumn Horizon curated campaign flyer
  autumnPromo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
  // Product launch tech marketing flyer
  productLaunch: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  // Enterprise webinar & executive conference flyer
  eventSummit: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80',
  // Special promo sale & discount voucher flyer
  promoSale: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80'
} as const;

/**
 * Normalizes any legacy or local asset path/filename to the corresponding stable online HTTPS URL.
 */
export function resolveImageUrl(src: string): string {
  if (!src) return '';

  // Already a valid HTTPS or HTTP online URL
  if (src.startsWith('https://') || src.startsWith('http://')) {
    return src;
  }

  // Data URLs or Blob URLs (e.g., dynamically generated)
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  // Map any legacy local strings or filenames to the verified online URLs
  const lower = src.toLowerCase();
  if (lower.includes('autumn') || lower.includes('promo_1791451512245')) {
    return ONLINE_FLYER_URLS.autumnPromo;
  }
  if (lower.includes('product_launch') || lower.includes('1791451528993')) {
    return ONLINE_FLYER_URLS.productLaunch;
  }
  if (lower.includes('event_summit') || lower.includes('1791453254848') || lower.includes('webinar')) {
    return ONLINE_FLYER_URLS.eventSummit;
  }
  if (lower.includes('promo_sale') || lower.includes('1791453235825') || lower.includes('discount')) {
    return ONLINE_FLYER_URLS.promoSale;
  }

  // Fallback to online Autumn promo if unspecified
  return ONLINE_FLYER_URLS.autumnPromo;
}
