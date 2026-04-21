import {
  CanActivate,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import request from 'supertest';
import { App } from 'supertest/types';
import { Role } from '../src/auth/enums/role.enum';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { ReportsController } from '../src/reports/reports.controller';
import { ReportsService } from '../src/reports/reports.service';

class MockJwtAuthGuard implements CanActivate {
  canActivate(context: any): boolean {
    const requestObj = context.switchToHttp().getRequest();
    const authHeader = requestObj.headers?.authorization;

    if (!authHeader) {
      return true; // Allow unauthenticated access for testing purposes   fil check
    }

    const headerRole = requestObj.headers?.['x-role'];
    const roleValue = Array.isArray(headerRole) ? headerRole[0] : headerRole;

    requestObj.user = {
      _id: '507f1f77bcf86cd799439011',
      email: 'moderator@example.com',
      firstName: 'Mod',
      lastName: 'User',
      role: roleValue || Role.USER,
    };

    return true;
  }
}

describe('Reports endpoints (e2e)', () => {
  let app: INestApplication<App>;

  const reportsServiceMock = {
    createForPlace: jest.fn(),
    getForPlace: jest.fn(),
    listForAdmin: jest.fn(),
    verify: jest.fn(),
    reject: jest.fn(),
    markSpam: jest.fn(),
    unmarkSpam: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportsService, useValue: reportsServiceMock },
        Reflector,
        { provide: APP_GUARD, useClass: MockJwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
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

  it('POST /places/:id/reports should create a report', async () => {
    reportsServiceMock.createForPlace.mockImplementation(async () => ({
      id: 'report-1',
      status: 'pending',
      issueType: 'incorrect_info',
    }));

    const response = await request(app.getHttpServer())
      .post('/places/osm%3Anode%3A123/reports')
      .set('Authorization', 'Bearer token')
      .send({
        issueType: 'incorrect_info',
        description: 'Ramp is blocked by boxes',
      })
      .expect(201);

    expect(response.body.id).toBe('report-1');
    expect(reportsServiceMock.createForPlace).toHaveBeenCalledWith(
      'osm:node:123',
      '507f1f77bcf86cd799439011',
      expect.objectContaining({
        issueType: 'incorrect_info',
      }),
    );
  });

  it('GET /places/:id/reports should return report list', async () => {
    reportsServiceMock.getForPlace.mockImplementation(async () => ({
      data: [],
    }));

    await request(app.getHttpServer())
      .get('/places/osm%3Anode%3A123/reports?limit=10')
      .expect(200);

    expect(reportsServiceMock.getForPlace).toHaveBeenCalledWith(
      'osm:node:123',
      10,
    );
  });

  it('GET /admin/reports should reject non-admin roles', async () => {
    await request(app.getHttpServer())
      .get('/admin/reports')
      .set('Authorization', 'Bearer token')
      .set('x-role', Role.USER)
      .expect(403);
  });

  it('GET /admin/reports should allow moderator role', async () => {
    reportsServiceMock.listForAdmin.mockImplementation(async () => ({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    }));

    await request(app.getHttpServer())
      .get('/admin/reports?status=pending')
      .set('Authorization', 'Bearer token')
      .set('x-role', Role.MODERATOR)
      .expect(200);

    expect(reportsServiceMock.listForAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending' }),
    );
  });

  it('PATCH /admin/reports/:id/verify should pass reason to service', async () => {
    reportsServiceMock.verify.mockImplementation(async () => ({
      id: 'report-1',
      status: 'verified',
    }));

    await request(app.getHttpServer())
      .patch('/admin/reports/507f1f77bcf86cd799439012/verify')
      .set('Authorization', 'Bearer token')
      .set('x-role', Role.ADMIN)
      .send({ reason: 'Confirmed with fresh photo evidence' })
      .expect(200);

    expect(reportsServiceMock.verify).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439012',
      '507f1f77bcf86cd799439011',
      'Confirmed with fresh photo evidence',
    );
  });
});
