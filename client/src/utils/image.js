/**
 * Formats a photo or image URL.
 * Handles relative paths (e.g. /uploads/profiles/xyz.png) by prepending backend server URL.
 */
export const getImageUrl = (url) => {
  if (!url) return null;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  return `${serverUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};
