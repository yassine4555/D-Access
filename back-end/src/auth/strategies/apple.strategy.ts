import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
    constructor(configService: ConfigService) {
        const enabled = configService.get<string>('ENABLE_APPLE_LOGIN') !== 'false';
        const clientID = configService.get<string>('APPLE_CLIENT_ID');
        const teamID = configService.get<string>('APPLE_TEAM_ID');
        const keyID = configService.get<string>('APPLE_KEY_ID');
        const keyPath = configService.get<string>('APPLE_PRIVATE_KEY_PATH');
        const callbackURL = configService.get<string>('APPLE_CALLBACK_URL');

        const privateKeyString = keyPath && fs.existsSync(keyPath)
            ? fs.readFileSync(keyPath, 'utf-8')
            : '';

        if (!enabled) {
            super({
                clientID: 'disabled',
                teamID: 'disabled',
                keyID: 'disabled',
                privateKeyString: 'disabled',
                callbackURL: 'disabled',
                scope: ['name', 'email'],
            } as any);
            return;
        }

        if (!clientID || !teamID || !keyID || !privateKeyString || !callbackURL) {
            throw new Error(
                'Apple Sign-In is enabled but APPLE_CLIENT_ID/APPLE_TEAM_ID/APPLE_KEY_ID/APPLE_PRIVATE_KEY_PATH/APPLE_CALLBACK_URL are not fully configured.',
            );
        }

        super({
            clientID,
            teamID,
            keyID,
            privateKeyString,
            callbackURL,
            scope:       ['name', 'email'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        idToken: any,
        profile: any,
        done: (err: any, user: any) => void,
    ): Promise<void> {
        // Apple passes user info in idToken on first login only
        const user = {
            id:           idToken?.sub,
            emails:       idToken?.email ? [{ value: idToken.email }] : [],
            displayName:  profile?.name
                ? `${profile.name.firstName ?? ''} ${profile.name.lastName ?? ''}`.trim()
                : '',
            photos:       [],
        };
        done(null, user);
    }
}
