/**
 * API Configuration
 * Sử dụng environment variable hoặc fallback về proxy trong development
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Helper function để tạo full API URL
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
}

