export function validateUrls(urls?: string | string[] | null): boolean {
  if (!urls) return false;
  const urlArray = Array.isArray(urls) ? urls : [urls];

  if (urlArray.length === 0) {
    return false;
  }

  return urlArray.every(url => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  });
}

export function validateApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  const trimmedKey = apiKey.trim();
  return trimmedKey.length > 0 && trimmedKey.startsWith('sk-');
}

export function sanitizeUrls(urls: string | string[]): string[] {
  const urlArray = Array.isArray(urls) ? urls : [urls];

  return urlArray
    .map(url => url.trim())
    .filter(url => {
      try {
        new URL(url);
        return url.startsWith('http://') || url.startsWith('https://');
      } catch {
        return false;
      }
    });
}

export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}
