import {
    Body, Controller, Get, Post, Req, Res, UseGuards, Query, UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

// Default deep link for standalone apps
const DEFAULT_DEEP_LINK = 'daccess://auth/callback';

// Helper to get redirect URI (from query param or default)
function getRedirectUri(req: any): string {
    const state = req.query?.state;
    if (typeof state === 'string' && state.length > 0) {
        try {
            return decodeURIComponent(state);
        } catch {
            return state;
        }
    }
    return DEFAULT_DEEP_LINK;
}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // ── Email / password ────────────────────────────────────────────────────
    @Post('login')
    async login(@Body() body: LoginDto) {
        console.log('🔵 [AUTH] POST /auth/login - Request:', { email: body.email });
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            console.log('❌ [AUTH] POST /auth/login - Invalid credentials');
            throw new UnauthorizedException('Invalid credentials');
        }
        const result = await this.authService.login(user);
        console.log('✅ [AUTH] POST /auth/login - Success:', { userId: user._id, email: user.email });
        return result;
    }

    @Post('register')
    async register(@Body() body: RegisterDto) {
        console.log('🔵 [AUTH] POST /auth/register - Request:', { email: body.email, firstName: body.firstName, lastName: body.lastName });
        const result = await this.authService.register(body);
        console.log('✅ [AUTH] POST /auth/register - Success:', { userId: (result.user as any)._id, email: result.user.email });
        return result;
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDto) {
        return this.authService.forgotPassword(body.email);
    }

    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordDto) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }

    // ── Protected profile ───────────────────────────────────────────────────
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@CurrentUser() user: any) {
        return user;
    }

    // ── Google OAuth ─────────────────────────────────────────────────────────
    @UseGuards(GoogleAuthGuard)
    @Get('google')
    googleLogin() {
        // Redirect handled by passport Google strategy.
    }

    @UseGuards(GoogleAuthGuard)
    @Get('google/callback')
    async googleCallback(@Req() req: any, @Res() res: Response) {
        console.log('🟢 [GOOGLE CALLBACK] Received callback from Google');
        console.log('🟢 [GOOGLE CALLBACK] User profile:', JSON.stringify({
            id: req.user?.id,
            email: req.user?.emails?.[0]?.value,
            name: req.user?.displayName,
            provider: req.user?.provider,
        }, null, 2));

        const { access_token } = await this.authService.socialLogin('google', req.user);
        console.log('🟢 [GOOGLE CALLBACK] Generated JWT token (length):', access_token.length);
        
        // Get redirect URI from OAuth state (passed from frontend)
        const redirectBase = getRedirectUri(req);
        const redirectUrl = `${redirectBase}?token=${access_token}`;
        
        console.log('🟢 [GOOGLE CALLBACK] Using redirect URI:', redirectBase);
        console.log('🟢 [GOOGLE CALLBACK] Full redirect URL:', redirectUrl);
        
        return res.redirect(redirectUrl);
    }

    // ── Facebook OAuth ───────────────────────────────────────────────────────
    @UseGuards(AuthGuard('facebook'))
    @Get('facebook')
    facebookLogin(@Query('redirect') redirect: string, @Res() res: Response) {
        if (redirect) {
            res.cookie('oauth_redirect', redirect, { httpOnly: true, maxAge: 600000 });
            console.log('🔵 [FACEBOOK LOGIN] Stored redirect URI in cookie:', redirect);
        }
    }

    @UseGuards(AuthGuard('facebook'))
    @Get('facebook/callback')
    async facebookCallback(@Req() req: any, @Res() res: Response) {
        console.log('🔵 [FACEBOOK CALLBACK] Received callback from Facebook');
        console.log('🔵 [FACEBOOK CALLBACK] User profile:', JSON.stringify({
            id: req.user?.id,
            email: req.user?.emails?.[0]?.value,
            name: req.user?.displayName,
        }, null, 2));

        const { access_token } = await this.authService.socialLogin('facebook', req.user);
        console.log('🔵 [FACEBOOK CALLBACK] Generated JWT token, redirecting...');
        
        const redirectBase = req.cookies?.oauth_redirect || DEFAULT_DEEP_LINK;
        const redirectUrl = `${redirectBase}?token=${access_token}`;
        res.clearCookie('oauth_redirect');
        
        return res.redirect(redirectUrl);
    }

    // ── Apple OAuth ──────────────────────────────────────────────────────────
    @UseGuards(AuthGuard('apple'))
    @Get('apple')
    appleLogin(@Query('redirect') redirect: string, @Res() res: Response) {
        if (redirect) {
            res.cookie('oauth_redirect', redirect, { httpOnly: true, maxAge: 600000 });
            console.log('⚫ [APPLE LOGIN] Stored redirect URI in cookie:', redirect);
        }
    }

    @UseGuards(AuthGuard('apple'))
    @Get('apple/callback')
    async appleCallback(@Req() req: any, @Res() res: Response) {
        console.log('⚫ [APPLE CALLBACK] Received callback from Apple');
        console.log('⚫ [APPLE CALLBACK] User profile:', JSON.stringify({
            id: req.user?.id,
            email: req.user?.emails?.[0]?.value,
            name: req.user?.displayName,
        }, null, 2));

        const { access_token } = await this.authService.socialLogin('apple', req.user);
        console.log('⚫ [APPLE CALLBACK] Generated JWT token, redirecting...');
        
        const redirectBase = req.cookies?.oauth_redirect || DEFAULT_DEEP_LINK;
        const redirectUrl = `${redirectBase}?token=${access_token}`;
        res.clearCookie('oauth_redirect');
        
        return res.redirect(redirectUrl);
    }
}

