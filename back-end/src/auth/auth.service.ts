import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        console.log('  → [AuthService] validateUser() - Checking:', email);
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            console.log('  ❌ [AuthService] validateUser() - User not found');
            return null;
        }
        const isValid = await bcrypt.compare(pass, user.passwordHash);
        if (isValid) {
            console.log('  ✅ [AuthService] validateUser() - Password valid');
            const { passwordHash, ...result } = (user as any).toObject();
            return result;
        }
        console.log('  ❌ [AuthService] validateUser() - Password invalid');
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user._id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }

    async register(registerDto: any) {
        console.log('  → [AuthService] register() - Starting for:', registerDto.email);
        const existingUser = await this.usersService.findOneByEmail(registerDto.email);
        if (existingUser) {
            console.log('  ❌ [AuthService] register() - User already exists');
            throw new UnauthorizedException('User already exists');
        }
        console.log('  → [AuthService] register() - Hashing password...');
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(registerDto.password, salt);

        console.log('  → [AuthService] register() - Creating user in DB...');
        const newUser = await this.usersService.create({
            email:        registerDto.email,
            firstName:    registerDto.firstName ?? '',
            lastName:     registerDto.lastName ?? '',
            passwordHash: hash,
            // Never trust client-provided role; default to a safe value.
            role: 'user',
        });

        console.log('  ✅ [AuthService] register() - User created, generating token...');
        return this.login(newUser);
    }

    /**
     * Called by every social OAuth callback.
     * Upserts the user via UsersService then issues a JWT.
     */
    async socialLogin(provider: string, profile: any) {
        const email     = profile.emails?.[0]?.value ?? '';
        const firstName = profile.name?.givenName  ?? profile.displayName?.split(' ')[0] ?? '';
        const lastName  = profile.name?.familyName ?? profile.displayName?.split(' ').slice(1).join(' ') ?? '';
        const avatarUrl = profile.photos?.[0]?.value ?? '';

        const user = await this.usersService.findOrCreateSocial({
            provider,
            providerId: profile.id,
            email,
            firstName,
            lastName,
            avatarUrl,
        });

        return this.buildToken(user);
    }

    private buildToken(user: any) {
        const obj     = typeof user.toObject === 'function' ? user.toObject() : user;
        const payload = { email: obj.email, sub: obj._id, role: obj.role };
        return { access_token: this.jwtService.sign(payload) };
    }

    /**
     * Generates a one-time reset token and stores it on the user.
     * In production, email the token instead of returning it.
     */
    async forgotPassword(email: string) {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            // Don't reveal whether the email exists
            return { message: 'If that email exists, a reset code has been sent.' };
        }

        const token  = crypto.randomBytes(16).toString('hex'); // 32-char hex token
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiry = new Date(Date.now() + 15 * 60 * 1000);               // 15 minutes
        await this.usersService.setResetToken(email, tokenHash, expiry);

        await this.mailService.sendPasswordReset(email, token);

        return { message: 'Reset code sent to your email.' };
    }

    async resetPassword(token: string, newPassword: string) {
        const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
        const user = await this.usersService.findByResetToken(tokenHash);
        if (!user) {
            throw new BadRequestException('Invalid or expired reset token.');
        }

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(newPassword, salt);
        await this.usersService.updatePasswordAndClearToken((user as any)._id.toString(), hash);

        return { message: 'Password reset successfully.' };
    }
}

