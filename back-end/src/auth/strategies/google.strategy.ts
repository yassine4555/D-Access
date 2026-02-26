import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(configService: ConfigService) {
        const enabled = configService.get<string>('ENABLE_GOOGLE_LOGIN') !== 'false';
        const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
        const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

        if (!enabled) {
            // Strategy is registered but effectively disabled via config flag.
            super({
                clientID: 'disabled',
                clientSecret: 'disabled',
                callbackURL: 'disabled',
                scope: ['email', 'profile'],
            } as any);
            return;
        }

        if (!clientID || !clientSecret || !callbackURL) {
            throw new Error(
                'Google OAuth is enabled but GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_CALLBACK_URL are not fully configured.',
            );
        }

        super({ clientID, clientSecret, callbackURL, scope: ['email', 'profile'] } as any);
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<void> {
        // Pass the raw profile to the controller;
        // AuthService.socialLogin() will handle upsert + JWT.
        done(null, profile);
    }
}
