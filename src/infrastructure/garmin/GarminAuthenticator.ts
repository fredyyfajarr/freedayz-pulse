import { createHash } from 'crypto';

interface CachedTokenEntry {
  token: string;
  expiresAt: number;
}

export class GarminAuthenticator {
  private static tokenCache = new Map<string, CachedTokenEntry>();

  private static getCacheKey(apiKey: string): string {
    return createHash('sha256').update(apiKey.trim()).digest('hex');
  }

  /**
   * Returns a valid Bearer token for personal.connectapi.garmin.com.
   * Caches tokens per API key in-memory and refreshes before expiration (default 24h validity).
   */
  public static async getBearerToken(apiKey?: string): Promise<string> {
    const key = (apiKey && apiKey.trim()) || process.env.GARMIN_PERSONAL_API_KEY;
    if (!key) {
      throw new Error(
        'Garmin Personal API Key is not configured. Please connect your key in Onboarding or set GARMIN_PERSONAL_API_KEY in .env.local'
      );
    }

    const cacheKey = this.getCacheKey(key);
    const now = Date.now();
    const cached = this.tokenCache.get(cacheKey);

    // If token exists and is valid for at least another 5 minutes, reuse it
    if (cached && cached.expiresAt > now + 5 * 60 * 1000) {
      return cached.token;
    }

    const tokenEndpoint =
      'https://personal.connectapi.garmin.com/personalapitoken-service/personal-api/personal-api-key/token';

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `ApiKey ${key.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to obtain Garmin Bearer token: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const rawText = await response.text();
    let tokenStr = rawText.trim();
    if (tokenStr.startsWith('"') && tokenStr.endsWith('"')) {
      tokenStr = tokenStr.slice(1, -1);
    } else {
      try {
        const parsed = JSON.parse(tokenStr);
        if (typeof parsed === 'string') {
          tokenStr = parsed;
        } else if (parsed && parsed.access_token) {
          tokenStr = parsed.access_token;
        }
      } catch {
        // raw string token
      }
    }

    // Default 23 hours cache to stay safely within 24h expiration
    this.tokenCache.set(cacheKey, {
      token: tokenStr,
      expiresAt: now + 23 * 60 * 60 * 1000,
    });

    return tokenStr;
  }

  public static clearCache(apiKey?: string): void {
    if (apiKey) {
      this.tokenCache.delete(this.getCacheKey(apiKey));
      return;
    }
    this.tokenCache.clear();
  }
}
