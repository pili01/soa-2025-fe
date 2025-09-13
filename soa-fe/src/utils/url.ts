export const API_BASE = 'http://localhost:8080';

export const API_IMG_BASE = import.meta.env.VITE_IMG_BASE ?? 'http://localhost:8080';

export function normalizeImageUrl(u: string) {
  const s = (u || '').trim();
  if (!s) return '';
  if (/^(data:|blob:|https?:\/\/)/i.test(s)) return s;
  return `${API_IMG_BASE}${s.startsWith('/') ? '' : '/'}${s}`;
}
