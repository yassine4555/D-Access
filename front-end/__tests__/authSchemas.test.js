import { describe, expect, it } from '@jest/globals';
import { authTokenPayloadSchema } from '../src/schemas/authSchemas';

describe('authTokenPayloadSchema', () => {
  it('accepts a valid auth response payload', () => {
    const result = authTokenPayloadSchema.safeParse({
      access_token: 'jwt-token',
      user: {
        _id: 'user-id-1',
        email: 'user@example.com',
        firstName: 'Yasso',
        lastName: 'Dev',
        role: 'USER',
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email in auth response payload', () => {
    const result = authTokenPayloadSchema.safeParse({
      access_token: 'jwt-token',
      user: {
        _id: 'user-id-1',
        email: 'invalid-email',
        firstName: 'Yasso',
        lastName: 'Dev',
        role: 'USER',
      },
    });

    expect(result.success).toBe(false);
  });
});
