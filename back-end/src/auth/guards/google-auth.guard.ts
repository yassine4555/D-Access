import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    getAuthenticateOptions(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        const redirect = req.query?.redirect;

        if (typeof redirect === 'string' && redirect.length > 0) {
            return { state: encodeURIComponent(redirect) };
        }

        return {};
    }
}