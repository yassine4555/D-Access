# D-Access Testing Guide

## 1. Purpose
This document describes the tests currently available in the D-Access project, what each test verifies, and how to run them.

## 2. Current Test Inventory

### Backend tests

#### Unit tests
- `back-end/src/app.controller.spec.ts`
  - Verifies the `AppController.getHello()` method returns `"Hello World!"`.
  - Purpose: basic unit smoke check for Nest unit-test setup.

#### End-to-end (e2e) tests
- `back-end/test/app.e2e-spec.ts`
  - Boots a Nest application and checks `GET /` returns HTTP 200 and `"Hello World!"`.
  - Includes `app.close()` after each test to avoid open-handle Jest issues.

- `back-end/test/auth-places.e2e-spec.ts`
  - Boots a test Nest app with real controllers and mocked services.
  - Uses global `ValidationPipe` to verify DTO validation behavior.
  - Covers these API scenarios:
    1. `POST /auth/register` success path and token response.
    2. `POST /auth/login` invalid credentials returns 401.
    3. `GET /auth/me` without bearer token returns 401.
    4. `GET /auth/me` with bearer token returns authenticated user.
    5. `GET /places/nearby` valid query returns expected payload.
    6. `GET /places/nearby` invalid latitude returns 400.
    7. `GET /places/:id` returns place details for a source id.

### Frontend tests

- `front-end/__tests__/authSchemas.test.js`
  - Tests auth response schema parsing (`authTokenPayloadSchema`).
  - Valid payload is accepted; invalid email payload is rejected.

- `front-end/__tests__/placeSchemas.test.js`
  - Tests place schema parsing and accessibility normalization.
  - Verifies wheelchair normalization, valid nearby payload acceptance, and invalid coordinate rejection.

- `front-end/__tests__/placesCacheService.test.js`
  - Tests cache utility behavior for nearby places.
  - Covers stable key generation, value storage/retrieval, and TTL expiration.

- `front-end/__tests__/apiService.test.js`
  - Tests API service behavior with mocked axios and config.
  - Covers:
    1. Invalid login payload shape throws a validation error.
    2. Nearby places retries next base URL on network errors.
    3. Nearby places does not retry on axios HTTP response errors.

## 3. How to Run Tests

### Backend
From `back-end/`:
- Unit tests: `npm test`
- e2e tests: `npm run test:e2e`
- Coverage (unit tests): `npm run test:cov`

### Frontend
From `front-end/`:
- Standard tests: `npm test`
- CI-style tests with coverage: `npm run test:ci`

## 4. What These Tests Protect Today

- Backend endpoint contracts for auth and places routing/validation paths.
- Frontend data contract safety using Zod schemas.
- Frontend API retry and error-handling logic.
- Frontend nearby cache correctness.

## 5. Known Gaps

- No screen-level integration tests yet for `LoginScreen` and `SignupScreen`.
- No backend integration with real database in e2e tests (services are mocked in auth/places e2e file).
- Backend test coverage is still focused on smoke and key endpoint behavior, not deep service/business logic.

## 6. Recommended Next Additions

1. Auth UI integration tests (login/signup happy path + validation + error display).
2. Backend service-level tests for Overpass normalization/dedup logic.
3. Additional places filtering/pagination edge-case tests.
4. Optional: enforce minimum coverage thresholds in CI.

## 7. CI Notes

- Frontend test script available: `test:ci` in `front-end/package.json`.
- Current workflow file: `.github/workflows/ci.yml`.
- Keep workflow test steps aligned with scripts defined in each package to avoid CI failures.
