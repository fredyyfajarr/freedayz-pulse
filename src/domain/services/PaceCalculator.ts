export class PaceCalculator {
  /**
   * Converts speed in meters per second to seconds per kilometer
   */
  public static mpsToSecPerKm(speedMps: number): number {
    if (!speedMps || speedMps <= 0.1) return 0;
    return 1000 / speedMps;
  }

  /**
   * Converts distance (meters) and duration (seconds) to seconds per kilometer
   */
  public static calculatePaceSecPerKm(distanceMeters: number, durationSeconds: number): number {
    if (!distanceMeters || distanceMeters <= 0 || !durationSeconds || durationSeconds <= 0) {
      return 0;
    }
    return (durationSeconds / (distanceMeters / 1000));
  }

  /**
   * Formats seconds per kilometer to a standard "mm:ss /km" string
   * e.g. 330 seconds -> "5:30 /km"
   */
  public static formatPace(secPerKm: number): string {
    if (!secPerKm || isNaN(secPerKm) || secPerKm <= 0 || secPerKm > 1800) {
      return '--:--';
    }
    const minutes = Math.floor(secPerKm / 60);
    const seconds = Math.round(secPerKm % 60);
    const paddedSec = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minutes}:${paddedSec} /km`;
  }

  /**
   * Formats duration in seconds to "h:mm:ss" or "mm:ss"
   */
  public static formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);

    const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;

    if (hrs > 0) {
      const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
      return `${hrs}:${paddedMins}:${paddedSecs}`;
    }
    return `${mins}:${paddedSecs}`;
  }

  /**
   * Formats distance in meters to kilometers with 2 decimals
   */
  public static formatDistance(meters: number): string {
    if (!meters || meters <= 0) return '0.00 km';
    return `${(meters / 1000).toFixed(2)} km`;
  }
}
