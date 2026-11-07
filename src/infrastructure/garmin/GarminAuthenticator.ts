export class GarminAuthenticator {
  private static cachedToken: string | null = null;
  private static tokenExpiresAt: number = 0;

  /**
   * Returns a valid Bearer token for personal.connectapi.garmin.com.
   * Caches the token in-memory and refreshes before expiration (default 24h validity).
   */
  public static async getBearerToken(apiKey?: string): Promise<string> {
    const key = apiKey || process.env.GARMIN_PERSONAL_API_KEY;
    if (!key) {
      throw new Error(
        'Garmin Personal API Key is not configured. Please set GARMIN_PERSONAL_API_KEY in .env.local'
      );
    }

    const now = Date.now();
    // If token exists and is valid for at least another 5 minutes, reuse it
    if (this.cachedToken && this.tokenExpiresAt > now + 5 * 60 * 1000) {
      return this.cachedToken;
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
    this.cachedToken = tokenStr;
    this.tokenExpiresAt = now + 23 * 60 * 60 * 1000;

    return this.cachedToken;
  }

  public static clearCache(): void {
    this.cachedToken = null;
    this.tokenExpiresAt = 0;
  }
}
