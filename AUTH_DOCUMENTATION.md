# D-Access  Authentication Module

> **Project:** D-Access (Accessibility Discovery App)
> **Module:** User Authentication
> **Stack:** NestJS  React Native / Expo  MongoDB
> **Level:** Student / Academic Project

---

## Table of Contents

1. [Phase 1  Requirements](#1-phase-1--requirements)
2. [Phase 2  Design](#2-phase-2--design)
3. [Phase 3  Implementation](#3-phase-3--implementation)
4. [Phase 4  Testing](#4-phase-4--testing)
5. [Configuration](#5-configuration)

---

## 1. Phase 1  Requirements

### 1.1 Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | A visitor can create an account with an email address and a password |
| FR-02 | A registered user can log in with their email and password |
| FR-03 | After login the user receives a token that grants access to protected resources |
| FR-04 | A user can log out; the token is discarded on the client |
| FR-05 | Protected API routes reject requests that carry no valid token |
| FR-06 | A user can request a password reset (optional  development mode only) |
| FR-07 | A user can sign in with a Google, Facebook, or Apple account (OAuth 2.0) |
| FR-08 | Certain API routes are restricted to users with the `admin` role |

### 1.2 Non-Functional Requirements

| ID | Requirement | Approach |
|----|-------------|----------|
| NFR-01 | Passwords must never be stored in plain text | Hash with **bcrypt** (cost factor 10) |
| NFR-02 | Stateless server  no sessions in the database | **JWT** signed with a server secret |
| NFR-03 | Token lifetime limits exposure if a token is stolen | Access token expires after **1 hour** |
| NFR-04 | Forms must validate user input before reaching the service | `class-validator` DTOs |
| NFR-05 | Token stored on the device | `AsyncStorage` (acceptable for academic scope) |

### 1.3 What Is Out of Scope

- Refresh token rotation (adds complexity not needed for a student project)
- Global rate limiting / Helmet security headers
- Server-side logout / token blacklisting

---

## 2. Phase 2  Design

### 2.1 Architecture

```
+------------------------------------------------------+
|               React Native App (Expo)                |
|                                                      |
|  App.tsx                                             |
|   +- <AuthProvider>   <- AuthContext.tsx             |
|       |  state : { user, token, isAuthenticated }    |
|       |  actions: login, register, logout            |
|       |                                              |
|       +- <AppNavigator>                              |
|           +- Auth Stack   (when NOT authenticated)   |
|           |   Login  /  Register  /  ForgotPassword  |
|           +- Main Stack   (when authenticated)       |
|               Home / Map / Settings ...              |
|                                                      |
|  api.ts  (axios)                                     |
|   +- request interceptor: attach Authorization header|
+---------------------+--------------------------------+
                      |  HTTP + JSON
+---------------------v--------------------------------+
|                  NestJS Back-End                     |
|                                                      |
|  AuthModule                                          |
|   +- AuthController  (/auth/register, /auth/login,   |
|   |                   /auth/me, /auth/google, ...)    |
|   +- AuthService     (bcrypt + JWT sign/verify)      |
|   +- JwtStrategy     (passport-jwt)                  |
|   +- GoogleStrategy  (passport-google-oauth20)       |
|   +- FacebookStrategy(passport-facebook)             |
|   +- AppleStrategy   (passport-apple)                |
|                                                      |
|  JwtAuthGuard  -> applied per-route with @UseGuards()|
|  RolesGuard    -> checks @Roles() metadata vs JWT    |
+---------------------+--------------------------------+
                      | Mongoose
             +--------v--------+
             |    MongoDB       |
             |  users collection|
             +-----------------+
```

### 2.2 Data Model  User Document

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated primary key |
| `email` | String | Unique, lowercase, trimmed |
| `passwordHash` | String | bcrypt hash — optional for social-only accounts |
| `provider` | String | `'local'`, `'google'`, `'facebook'`, or `'apple'` |
| `providerId` | String | OAuth provider's unique user ID |
| `profile.name` | String | Display name |
| `profile.avatarUrl` | String | Optional profile picture |
| `role` | String | `'user'` (default) or `'admin'` |
| `resetPasswordToken` | String | Short-lived plain token (dev / optional) |
| `resetPasswordExpires` | Date | Expiry for the token above |
| `createdAt` | Date | Auto by Mongoose timestamps |
| `updatedAt` | Date | Auto by Mongoose timestamps |

### 2.3 API Endpoints

| Method | Path | Protected | Description |
|--------|------|-----------|-------------|
| POST | `/auth/register` | No | Create a new account |
| POST | `/auth/login` | No | Obtain a JWT |
| GET | `/auth/me` | Yes (JWT) | Return the logged-in user's profile |
| POST | `/auth/forgot-password` | No | Generate a reset token (dev only) |
| POST | `/auth/reset-password` | No | Apply a new password with the token |
| GET | `/auth/google` | No | Redirect to Google OAuth consent screen |
| GET | `/auth/google/callback` | No | Google OAuth callback — returns JWT |
| GET | `/auth/facebook` | No | Redirect to Facebook OAuth consent screen |
| GET | `/auth/facebook/callback` | No | Facebook OAuth callback — returns JWT |
| GET | `/auth/apple` | No | Redirect to Apple OAuth consent screen |
| GET | `/auth/apple/callback` | No | Apple OAuth callback — returns JWT |

Logout has **no server endpoint**  the client simply deletes the token from AsyncStorage.

#### Request / Response shapes

```
POST /auth/register
  Body:    { "email": "alice@example.com", "password": "secret123", "name": "Alice" }
  201 OK:  { "access_token": "<jwt>", "user": { "_id", "email", "profile" } }
  409:     { "message": "Email already in use" }

POST /auth/login
  Body:    { "email": "alice@example.com", "password": "secret123" }
  200 OK:  { "access_token": "<jwt>", "user": { "_id", "email", "profile" } }
  401:     { "message": "Invalid credentials" }

GET /auth/me
  Header:  Authorization: Bearer <jwt>
  200 OK:  { "_id", "email", "profile", "role" }
  401:     { "message": "Unauthorized" }

POST /auth/forgot-password
  Body:    { "email": "alice@example.com" }
  200 OK:  { "message": "If that email exists a reset token has been sent.",
             "resetToken": "<token>" }  <- returned in body for dev/demo only

POST /auth/reset-password
  Body:    { "token": "<token>", "newPassword": "newSecret123" }
  200 OK:  { "message": "Password reset successfully" }
  400:     { "message": "Invalid or expired token" }

GET /auth/google          ->  302 redirect to Google consent screen
GET /auth/google/callback ->  302 redirect to app deep link
  Deep link: dAccess://auth/callback?token=<jwt>

(Same pattern for /auth/facebook and /auth/apple)
```

### 2.4 JWT Token Design

```
Algorithm : HS256
Secret    : JWT_SECRET  (set in .env, required)
TTL       : 1 hour  (JWT_EXPIRES_IN=1h)

Payload:
{
  "sub"   : "<userId>",
  "email" : "alice@example.com",
  "role"  : "user",
  "iat"   : <issued-at>,
  "exp"   : <expiry>
}

Storage (client):
  SecureStore key "userToken"  <- JWT string
```

**Why no refresh token?**
Refresh token rotation adds significant complexity (secure storage, rotation logic, server-side
invalidation). For an academic project a single 1-hour token in AsyncStorage is sufficient and
much easier to explain in a report.

**Client-side logout:**
Since the server is stateless, logout is simply deleting the token from AsyncStorage. The
in-flight token will expire naturally  an acceptable trade-off at this scope.

### 2.5 Authentication Flow Diagrams

#### Registration

```
Client                        Server                  DB
------                        ------                  --
POST /auth/register
  { email, password, name }
                  ----------->
                              Validate DTO
                              findOneByEmail()         --> null (not taken)
                              bcrypt.hash(password, 10)
                              usersService.create()    --> save document
                              jwtService.sign(payload)
                  <-----------
{ access_token, user }

Save "userToken" to SecureStore
isAuthenticated = true  ->  Main Stack
```

#### Login

```
Client                        Server                  DB
------                        ------                  --
POST /auth/login
  { email, password }
                  ----------->
                              findOneByEmail()         --> user document
                              bcrypt.compare(pw, hash)
                              jwtService.sign(payload)
                  <-----------
{ access_token, user }

Save "userToken" to AsyncStorage
isAuthenticated = true  ->  Main Stack
```

#### Accessing a Protected Route

```
Client                        Server
------                        ------
GET /places
Authorization: Bearer <jwt>
                  ----------->
                              JwtAuthGuard runs
                              PassportJS verifies signature + expiry
                              JwtStrategy.validate() returns user
                  <-----------
200 OK  { data }

--- if token is missing or expired ---
                  <-----------
                              401 Unauthorized
App shows "session expired" message  ->  Login screen
```

#### Logout (client only)

```
User taps "Logout"
Delete "userToken" from AsyncStorage
Delete "userId"   from AsyncStorage
Set isAuthenticated = false
AppNavigator switches to Auth Stack automatically
(No server call needed)
```

#### Social Login (Google / Facebook / Apple)

```
Client (Expo)                 Server                  DB
-------------                 ------                  --
expo-auth-session opens
  provider consent screen
  user approves
  auth code returned

GET /auth/google/callback
  ?code=...&state=...
                  ----------->
                              GoogleStrategy.validate()
                              findOrCreateSocial()     --> upsert user
                              jwtService.sign(payload)
                  <-----------
302 -> dAccess://auth/callback?token=<jwt>

App reads token from URL
Save "userToken" to AsyncStorage
isAuthenticated = true  ->  Main Stack
```

#### Accessing an Admin-Only Route

```
Client                        Server
------                        ------
DELETE /admin/users/:id
Authorization: Bearer <jwt>
                  ----------->
                              JwtAuthGuard -> validates JWT
                              RolesGuard   -> checks role === 'admin'
                  <-----------
200 OK  (if role is admin)
403 Forbidden  (if role is user)
```

#### Password Reset

```
Client                        Server                  DB
------                        ------                  --
POST /auth/forgot-password
  { email }
                  ----------->
                              findOneByEmail()
                              crypto.randomBytes(32) -> token
                              set expires = now + 1h
                              save token + expiry      --> update user
                  <-----------
{ message, resetToken }   <- dev: token returned in response body

POST /auth/reset-password
  { token, newPassword }
                  ----------->
                              find user where token matches AND expires > now
                              bcrypt.hash(newPassword, 10)
                              update passwordHash
                              clear resetPasswordToken --> save
                  <-----------
{ message: "Password reset successfully" }
-> Login screen
```

---

## 3. Phase 3  Implementation

### 3.1 Back-End

#### Packages used

| Package | Purpose |
|---------|---------|
| `@nestjs/passport` | Passport integration for NestJS |
| `@nestjs/jwt` | JWT sign / verify helper |
| `passport-jwt` | Strategy that extracts and validates JWTs from headers |
| `bcrypt` | Password hashing |
| `class-validator` | DTO field validation decorators |
| `class-transformer` | Transforms plain JSON into DTO class instances |
| `passport-google-oauth20` | Google OAuth 2.0 Passport strategy |
| `@types/passport-google-oauth20` | TypeScript types for the above |
| `passport-facebook` | Facebook OAuth 2.0 Passport strategy |
| `@types/passport-facebook` | TypeScript types for the above |
| `passport-apple` | Apple Sign-In Passport strategy |

Install the new packages:
```bash
npm install passport-google-oauth20 passport-facebook passport-apple
npm install -D @types/passport-google-oauth20 @types/passport-facebook
```

#### File structure

```
back-end/src/
+-- main.ts                       ValidationPipe (global)
+-- auth/
|   +-- auth.module.ts            JwtModule, PassportModule + social strategies
|   +-- auth.controller.ts        /auth/* routes incl. social callbacks
|   +-- auth.service.ts           register, login, socialLogin, forgotPassword, resetPassword
|   +-- jwt.strategy.ts           validates JWT and loads user from DB
|   +-- strategies/
|   |   +-- google.strategy.ts    passport-google-oauth20
|   |   +-- facebook.strategy.ts  passport-facebook
|   |   +-- apple.strategy.ts     passport-apple
|   +-- guards/
|   |   +-- jwt-auth.guard.ts     @UseGuards(JwtAuthGuard) on protected routes
|   |   +-- roles.guard.ts        @UseGuards(RolesGuard) checks @Roles() metadata
|   +-- decorators/
|   |   +-- current-user.decorator.ts  @CurrentUser() param decorator
|   |   +-- roles.decorator.ts    @Roles(Role.ADMIN) metadata decorator
|   +-- enums/
|   |   +-- role.enum.ts          enum Role { USER = 'user', ADMIN = 'admin' }
|   +-- dto/
|       +-- register.dto.ts
|       +-- login.dto.ts
|       +-- forgot-password.dto.ts
|       +-- reset-password.dto.ts
+-- users/
    +-- users.service.ts          findOneByEmail, findOrCreateSocial, create, findById, update
    +-- schemas/
        +-- user.schema.ts        email, passwordHash?, provider, providerId, profile, role, reset fields
```

#### Key implementation details

**register + login (auth.service.ts)**

```typescript
async register(dto: RegisterDto) {
    const existing = await this.usersService.findOneByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
        email:        dto.email,
        passwordHash: hash,
        profile:      { name: dto.name ?? '' },
    });
    return this.buildResponse(user);
}

async login(dto: LoginDto) {
    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return this.buildResponse(user);
}

private buildResponse(user) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
        access_token: this.jwtService.sign(payload),
        user:         { _id: user._id, email: user.email, profile: user.profile },
    };
}
```

**JwtAuthGuard (guards/jwt-auth.guard.ts)**

Simple wrapper around PassportJS. Attach it to any route that requires the user to be logged in:

```typescript
@UseGuards(JwtAuthGuard)
@Get('me')
getMe(@CurrentUser() user) {
    return user;
}
```

**RolesGuard + @Roles decorator (RBAC)**

```typescript
// enums/role.enum.ts
export enum Role {
    USER  = 'user',
    ADMIN = 'admin',
}

// decorators/roles.decorator.ts
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<Role[]>('roles', [
            context.getHandler(), context.getClass(),
        ]);
        if (!required) return true;   // no @Roles() -> any authenticated user
        const { user } = context.switchToHttp().getRequest();
        return required.includes(user.role);
    }
}
```

Usage on admin-only routes:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Delete('users/:id')
deleteUser() { ... }
```

**Social login (auth.service.ts)**

```typescript
async socialLogin(provider: string, profile: any) {
    const user = await this.usersService.findOrCreateSocial({
        provider,
        providerId: profile.id,
        email:      profile.emails?.[0]?.value ?? '',
        name:       profile.displayName ?? '',
        avatarUrl:  profile.photos?.[0]?.value ?? '',
    });
    return this.buildResponse(user);
}
```

**Google strategy example (strategies/google.strategy.ts)**

```typescript
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(configService: ConfigService) {
        super({
            clientID:     configService.get('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
            callbackURL:  '/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }
    async validate(_at: string, _rt: string, profile: Profile) {
        return profile;  // passed to req.user -> controller calls socialLogin()
    }
}
```

**main.ts bootstrap**

```typescript
app.useGlobalPipes(new ValidationPipe({
    whitelist: true,   // strip any fields not in the DTO
    transform: true,   // auto-convert JSON -> DTO class instance
}));
```

#### Auth controller summary

```typescript
@Controller('auth')
export class AuthController {
    @Post('register')                          register(@Body() dto: RegisterDto)
    @Post('login')                             login(@Body() dto: LoginDto)
    @UseGuards(JwtAuthGuard) @Get('me')        getMe(@CurrentUser() user)
    @Post('forgot-password')                   forgotPassword(@Body() dto: ForgotPasswordDto)
    @Post('reset-password')                    resetPassword(@Body() dto: ResetPasswordDto)

    // Social login
    @UseGuards(AuthGuard('google')) @Get('google')            googleLogin()
    @UseGuards(AuthGuard('google')) @Get('google/callback')   googleCallback(@Req() req, @Res() res)
    @UseGuards(AuthGuard('facebook')) @Get('facebook')        facebookLogin()
    @UseGuards(AuthGuard('facebook')) @Get('facebook/callback') facebookCallback(@Req() req, @Res() res)
    @UseGuards(AuthGuard('apple')) @Get('apple')              appleLogin()
    @UseGuards(AuthGuard('apple')) @Get('apple/callback')     appleCallback(@Req() req, @Res() res)
    // Each callback calls authService.socialLogin(provider, req.user)
    // then redirects to: dAccess://auth/callback?token=<jwt>
}
```

---

### 3.2 Front-End

#### Packages used

| Package | Purpose |
|---------|----------|
| `axios` | HTTP client (already installed) |
| `@react-native-async-storage/async-storage` | Token persistence (already installed) |
| `expo-auth-session` | Opens OAuth browser session and handles redirect |
| `expo-web-browser` | Required by `expo-auth-session` for the browser flow |

Install the new packages:
```bash
npx expo install expo-auth-session expo-web-browser
```

#### File structure

```
front-end/src/
+-- context/
|   +-- AuthContext.tsx      state + actions (login, register, logout, social logins)
+-- services/
|   +-- api.ts               axios instance + request interceptor
+-- navigation/
|   +-- AppNavigator.tsx     switches stack based on isAuthenticated
|   +-- linking.ts           deep-link config  dAccess://auth/callback
+-- screens/
    +-- auth/
    |   +-- LoginScreen.tsx  (Google / Facebook / Apple buttons wired)
    |   +-- SignupScreen.tsx
    |   +-- ForgotPasswordScreen.tsx
    |   +-- ResetPasswordScreen.tsx
    +-- main/
        +-- SettingsScreen.tsx   (logout button)
```

#### AuthContext

```typescript
// State
user:            AuthUser | null
token:           string | null
isAuthenticated: boolean
isLoading:       boolean   // true while reading SecureStore at app start

// Actions
login(email, password)   // POST /auth/login  -> save token -> set state
register(email, ...)     // POST /auth/register -> save token -> set state
logout()                 // delete token from SecureStore -> clear state
loginWithGoogle()        // WebBrowser.openAuthSessionAsync -> /auth/google -> deep link -> save token
loginWithFacebook()      // WebBrowser.openAuthSessionAsync -> /auth/facebook -> deep link -> save token
loginWithApple()         // WebBrowser.openAuthSessionAsync -> /auth/apple -> deep link -> save token
```

**Social login flow on the client:**

```
1. AuthContext.socialLogin(provider) builds:
     - authUrl   = `${API_BASE_URL}/auth/${provider}`
     - redirect  = AuthSession.makeRedirectUri({ scheme: 'daccess', path: 'auth/callback' })
2. WebBrowser.openAuthSessionAsync(authUrl, redirect) opens the provider consent screen
3. User approves -> provider redirects back to /auth/{provider}/callback on the backend
4. Backend creates JWT and redirects to: daccess://auth/callback?token=<jwt>
5. WebBrowser returns the deep-link URL to the app
6. AuthContext.handleDeepLink(url) parses the token, stores it in SecureStore,
   calls /auth/me, and sets isAuthenticated = true
```

**Session restore on app start:**

```
1. Read "userToken" from AsyncStorage
2. If token found:
     GET /auth/me with Bearer token
     -> 200: set user + isAuthenticated = true
     -> 401: token expired -> clear AsyncStorage -> stay on Login screen
3. isLoading = false -> AppNavigator renders the correct stack
```

#### api.ts

```typescript
// Attach token on every request
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
// No response interceptor needed
```

#### AppNavigator logic

```
isLoading = true        ->  ActivityIndicator (prevent flash)
isAuthenticated = true  ->  Main Stack (tabs)
isAuthenticated = false ->  Auth Stack (Login / Register / ...)
```

The navigator automatically re-renders when `isAuthenticated` changes  no manual
`navigation.replace()` calls needed in screens.

---

## 4. Phase 4  Testing

### 4.1 Test Cases

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| TC-01 | Register with new email + password >= 6 chars | 201, `access_token` returned |
| TC-02 | Register with an existing email | 409 "Email already in use" |
| TC-03 | Register with password shorter than 6 characters | 400 validation error |
| TC-04 | Login with correct credentials | 200, `access_token` returned |
| TC-05 | Login with wrong password | 401 "Invalid credentials" |
| TC-06 | Login with unknown email | 401 "Invalid credentials" |
| TC-07 | GET /auth/me with a valid token | 200, user profile returned |
| TC-08 | GET /auth/me with no token | 401 Unauthorized |
| TC-09 | GET /auth/me with an expired token | 401 Unauthorized |
| TC-10 | Forgot password with a registered email | 200, token in response (dev) |
| TC-11 | Forgot password with an unknown email | 200, same generic message |
| TC-12 | Reset password with valid token + new password | 200, login with new password works |
| TC-13 | Reset password with expired / wrong token | 400 "Invalid or expired token" |
| TC-14 | Social login with valid Google account (new user) | 200, account created, `access_token` returned |
| TC-15 | Social login with valid Google account (existing user) | 200, existing account matched, `access_token` returned |
| TC-16 | Social login with valid Facebook account | 200, `access_token` returned |
| TC-17 | Social login with valid Apple account | 200, `access_token` returned |
| TC-18 | Access admin route with role = `admin` | 200 OK |
| TC-19 | Access admin route with role = `user` | 403 Forbidden |
| TC-20 | Access admin route with no token | 401 Unauthorized |

### 4.2 Manual App Checklist

```
Registration
 [ ] Fill form and tap Register -> lands on Home screen
 [ ] Same email twice -> error shown
 [ ] Empty field -> inline validation error shown

Login
 [ ] Correct credentials -> lands on Home screen
 [ ] Wrong password -> error message shown
 [ ] Kill app, reopen -> still logged in (token from AsyncStorage)

Protected routes
 [ ] With valid session, all main screens load normally
 [ ] Delete token from AsyncStorage manually -> reopen app -> Login screen

Logout
 [ ] Tap Logout in Settings -> confirm -> lands on Login / Welcome
 [ ] Press Back -> cannot navigate back to main screen

Password Reset
 [ ] Enter email -> success message
 [ ] Enter code from email + new password -> success -> login with new password works

Social Login
 [ ] Tap Google button -> browser opens -> approve -> lands on Home screen
 [ ] Tap Facebook button -> browser opens -> approve -> lands on Home screen
 [ ] Tap Apple button -> browser opens -> approve -> lands on Home screen
 [ ] Social login with already-registered email -> account linked, not duplicated

Role-Based Access Control
 [ ] Admin user can access admin-only endpoints (200)
 [ ] Regular user gets 403 on admin-only endpoints
 [ ] Unauthenticated request gets 401 on admin-only endpoints
```

---

## 5. Configuration

### `back-end/.env`

```dotenv
PORT=3000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/dAccess

JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=1h

# Google OAuth  (Google Cloud Console -> APIs & Services -> Credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth  (developers.facebook.com -> My Apps)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Apple Sign-In  (developer.apple.com -> Certificates -> Service IDs)
APPLE_CLIENT_ID=your-apple-service-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY_PATH=./secrets/apple-auth-key.p8
```

Generate a random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Front-end API base URL (`front-end/src/services/api.ts`)

```typescript
const API_BASE_URL = 'http://<YOUR_LOCAL_IP>:3000';
// Use your machine LAN IP (e.g. 192.168.1.10), not localhost.
```

### Running the project

```bash
# Backend
cd back-end && npm install && npm run start:dev

# Frontend
cd front-end && npm install && npx expo start
```
