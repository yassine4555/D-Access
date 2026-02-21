import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = (user as any).toObject();
            return result;
        }
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
        const existingUser = await this.usersService.findOneByEmail(registerDto.email);
        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(registerDto.password, salt);

        const newUser = await this.usersService.create({
            email: registerDto.email,
            passwordHash: hash,
            profile: {
                name: registerDto.name,
            },
            role: registerDto.role || 'user',
        });

        return this.login(newUser);
    }
}
