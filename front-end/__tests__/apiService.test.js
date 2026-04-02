import { describe, expect, it, jest, beforeEach } from '@jest/globals';

const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
    },
  },
};

const mockIsAxiosError = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => mockApi),
  },
  isAxiosError: (...args) => mockIsAxiosError(...args),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
}));

jest.mock('../src/config/api', () => ({
  getApiBaseUrl: () => 'http://localhost:3000',
  getApiBaseUrlCandidates: () => ['http://candidate-1:3000', 'http://candidate-2:3000'],
}));

describe('api service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAxiosError.mockReset();
  });

  it('authApi.login throws on invalid payload shape', async () => {
    const { authApi } = require('../src/services/api');

    mockApi.post.mockResolvedValue({
      data: {
        invalid: true,
      },
    });

    await expect(authApi.login('user@example.com', 'password123')).rejects.toThrow(
      'Invalid login response from server',
    );
  });

  it('placesApi.findNearby retries next base URL on network error', async () => {
    const { placesApi } = require('../src/services/api');

    const networkError = new Error('network down');
    mockApi.get
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce({
        data: {
          data: [
            {
              sourceId: 'osm:node:1',
              name: 'Cafe One',
              category: 'cafe',
              location: {
                type: 'Point',
                coordinates: [10.1, 36.8],
              },
            },
          ],
        },
      });

    mockIsAxiosError.mockReturnValue(false);

    const response = await placesApi.findNearby(36.8, 10.1);

    expect(response.data.data).toHaveLength(1);
    expect(mockApi.get).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/places/nearby?'),
      { baseURL: 'http://candidate-1:3000' },
    );
    expect(mockApi.get).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/places/nearby?'),
      { baseURL: 'http://candidate-2:3000' },
    );
  });

  it('placesApi.findNearby stops retrying on HTTP response error', async () => {
    const { placesApi } = require('../src/services/api');

    const httpError = {
      response: { status: 400, data: { message: 'Bad request' } },
    };

    mockApi.get.mockRejectedValue(httpError);
    mockIsAxiosError.mockReturnValue(true);

    await expect(placesApi.findNearby(36.8, 10.1)).rejects.toBe(httpError);
    expect(mockApi.get).toHaveBeenCalledTimes(1);
  });
});
