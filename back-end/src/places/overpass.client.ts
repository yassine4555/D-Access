import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance } from 'axios';

type OverpassElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

@Injectable()
export class OverpassClient {
  private readonly logger = new Logger(OverpassClient.name);
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://overpass-api.de/api',
      timeout: 45_000,
    });
  }

  async queryPlaces(lat: number, lon: number, radius: number) {
    const query = this.buildQuery(lat, lon, radius);
    const response = await this.withRetry(() =>
      this.client.post<OverpassResponse>('/interpreter', query, {
        headers: {
          Accept: '*/*',
          'Content-Type': 'text/plain',
          'User-Agent': 'D-Access/1.0',
        },
      }),
    );

    const elements = response.data?.elements;
    if (!Array.isArray(elements)) {
      this.logger.warn('Overpass response missing elements array');
      return [] as OverpassElement[];
    }

    return elements;
  }

  private buildQuery(lat: number, lon: number, radius: number): string {
    return `
[out:json][timeout:40];
(
  nwr(around:${radius},${lat},${lon})[amenity];
  nwr(around:${radius},${lat},${lon})[shop];
  nwr(around:${radius},${lat},${lon})[tourism];
  nwr(around:${radius},${lat},${lon})[leisure];
  nwr(around:${radius},${lat},${lon})[healthcare];
  nwr(around:${radius},${lat},${lon})[wheelchair];
  nwr(around:${radius},${lat},${lon})["toilets:wheelchair"];
);
out center tags qt;
`;
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts = 3,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const canRetry = this.isRetryable(error) && attempt < maxAttempts;

        if (!canRetry) {
          this.logger.error(
            `Overpass request failed on attempt ${attempt}/${maxAttempts}`,
            this.extractErrorMessage(error),
          );
          throw error;
        }

        const backoffMs = 500 * 2 ** (attempt - 1);
        this.logger.warn(
          `Overpass attempt ${attempt}/${maxAttempts} failed, retrying in ${backoffMs}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    throw lastError;
  }

  private isRetryable(error: unknown): boolean {
    if (!axios.isAxiosError(error)) {
      return false;
    }

    const status = error.response?.status;
    if (!status) {
      return true;
    }

    return status >= 500 || status === 429;
  }

  private extractErrorMessage(error: unknown): string {
    if (!axios.isAxiosError(error)) {
      return String(error);
    }

    const axiosError = error as AxiosError;
    return (
      axiosError.response?.statusText ?? axiosError.message ?? 'Unknown error'
    );
  }
}
