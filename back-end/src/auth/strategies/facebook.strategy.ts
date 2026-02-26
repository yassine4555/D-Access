import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(configService: ConfigService) {
        const enabled = configService.get<string>('ENABLE_FACEBOOK_LOGIN') !== 'false';
        const clientID = configService.get<string>('FACEBOOK_APP_ID');
        const clientSecret = configService.get<string>('FACEBOOK_APP_SECRET');
        const callbackURL = configService.get<string>('FACEBOOK_CALLBACK_URL');

        if (!enabled) {
            super({
                clientID: 'disabled',
                clientSecret: 'disabled',
                callbackURL: 'disabled',
                profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
            } as any);
            return;
        }

        if (!clientID || !clientSecret || !callbackURL) {
            throw new Error(
                'Facebook OAuth is enabled but FACEBOOK_APP_ID/FACEBOOK_APP_SECRET/FACEBOOK_CALLBACK_URL are not fully configured.',
            );
        }

        super({
            clientID,
            clientSecret,
            callbackURL,
            profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: (err: any, user: any) => void,
    ): Promise<void> {
        done(null, profile);
    }
}
