import { Conversation } from '../types';
import { ONLINE_FLYER_URLS } from './imageAssets';

/** Stable HTTPS placeholders so localStorage never stores base64 media. */
export const PLACEHOLDER_VIDEO_URL =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

export const PLACEHOLDER_IMAGE_URL = ONLINE_FLYER_URLS.promoSale;

export const PERSONALIZED_MAX_IMAGES = 5;
export const PERSONALIZED_MAX_VIDEOS = 3;
export const FLYER_MAX_IMAGES = 3;

const isInlineMedia = (url: string) =>
  url.startsWith('data:') || url.startsWith('blob:');

export function compactMediaUrl(url: string, kind: 'image' | 'video' = 'image'): string {
  if (!url || !isInlineMedia(url)) return url;
  if (kind === 'video' || url.startsWith('data:video')) return PLACEHOLDER_VIDEO_URL;
  return PLACEHOLDER_IMAGE_URL;
}

/** Strip heavy data/blob URLs before writing conversations to localStorage. */
export function compactConversationsForStorage(
  map: Record<string, Conversation[]>
): Record<string, Conversation[]> {
  const out: Record<string, Conversation[]> = {};

  for (const [uid, convs] of Object.entries(map)) {
    out[uid] = convs.map((c) => ({
      ...c,
      messages: c.messages.map((m) => ({
        ...m,
        images: m.images?.map((img) => compactMediaUrl(img, 'image')),
        imageUrl: m.imageUrl ? compactMediaUrl(m.imageUrl, 'image') : m.imageUrl,
        videos: m.videos?.map((vid) => compactMediaUrl(vid, 'video'))
      }))
    }));
  }

  return out;
}

export function safeSetLocalStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    try {
      localStorage.removeItem(key);
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}
