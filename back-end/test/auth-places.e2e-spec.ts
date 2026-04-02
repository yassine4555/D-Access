import {
  CanActivate,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { PlacesController } from '../src/places/places.controller';
import { PlacesService } from '../src/places/places.service';

class MockJwtAuthGuard implements CanActivate {
  canActivate(context: any): boolean {
    const requestObj = context.switchToHttp().getRequest();
    const authHeader = requestObj.headers?.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing bearer token');
    }

    requestObj.user = {
      _id: 'user-1',
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'One',
      role: 'user',
    };

    return true;
  }
}

describe('Auth + Places endpoints (e2e)', () => {
  let app: INestApplication<App>;

  const authServiceMock = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  };

  const placesServiceMock = {
    findNearby: jest.fn(),
    getPlaceById: jest.fn(),
    seedFromOverpass: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, PlacesController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: PlacesService, useValue: placesServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/register should create account and return token', async () => {
    authServiceMock.register.mockResolvedValue({
      access_token: 'token-1',
      user: {
        _id: 'u1',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'user',
      },
    });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      })
      .expect(201);

    expect(response.body.access_token).toBe('token-1');
    expect(authServiceMock.register).toHaveBeenCalledTimes(1);
  });

  it('POST /auth/login should reject invalid credentials', async () => {
    authServiceMock.validateUser.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'bad-password',
      })
      .expect(401);

    expect(authServiceMock.validateUser).toHaveBeenCalledWith(
      'wrong@example.com',
      'bad-password',
    );
  });

  it('GET /auth/me should fail without bearer token', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('GET /auth/me should return current user with bearer token', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer fake-token')
      .expect(200);

    expect(response.body.email).toBe('user@example.com');
  });

  it('GET /places/nearby should validate query and return result', async () => {
    placesServiceMock.findNearby.mockResolvedValue({
      data: [
        {
          sourceId: 'osm:node:1',
          name: 'Cafe Test',
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/places/nearby?lat=36.8&lon=10.1&radius=1500&page=1&limit=20&wheelchairKnown=true')
      .expect(200);

    expect(response.body.pagination.total).toBe(1);
    expect(placesServiceMock.findNearby).toHaveBeenCalledWith(
      expect.objectContaining({
        lat: 36.8,
        lon: 10.1,
        radius: 1500,
        page: 1,
        limit: 20,
        wheelchairKnown: true,
      }),
    );
  });

  it('GET /places/nearby should return 400 for invalid latitude', async () => {
    await request(app.getHttpServer())
      .get('/places/nearby?lat=999&lon=10.1')
      .expect(400);
  });

  it('GET /places/:id should return place details', async () => {
    placesServiceMock.getPlaceById.mockResolvedValue({
      sourceId: 'osm:node:123',
      source: 'osm',
      name: 'Place One',
      category: 'cafe',
      location: {
        type: 'Point',
        coordinates: [10.1, 36.8],
      },
      accessibility: {
        wheelchair: 'yes',
        toiletsWheelchair: 'unknown',
      },
      tagsSummary: {},
      updatedAt: new Date().toISOString(),
    });

    const response = await request(app.getHttpServer())
      .get('/places/osm%3Anode%3A123')
      .expect(200);

    expect(response.body.sourceId).toBe('osm:node:123');
    expect(placesServiceMock.getPlaceById).toHaveBeenCalledWith(
      'osm:node:123',
    );
  });
});
