import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(createUserDto: any): Promise<User> {
        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }

    async setResetToken(email: string, tokenHash: string, expiry: Date): Promise<void> {
        await this.userModel.findOneAndUpdate(
            { email },
            { resetTokenHash: tokenHash, resetTokenExpiry: expiry },
        ).exec();
    }

    async findByResetToken(tokenHash: string): Promise<UserDocument | null> {
        return this.userModel
            .findOne({ resetTokenHash: tokenHash.trim(), resetTokenExpiry: { $gt: new Date() } })
            .exec() as Promise<UserDocument | null>;
    }

    async updatePasswordAndClearToken(userId: string, passwordHash: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(
            userId,
            { passwordHash, resetTokenHash: null, resetTokenExpiry: null },
        ).exec();
    }

    /**
     * Find an existing user by (provider, providerId) or create a new one.
     * Used by all social-login strategies.
     */
    async findOrCreateSocial(data: {
        provider:   string;
        providerId: string;
        email:      string;
        firstName:  string;
        lastName:   string;
        avatarUrl?: string;
    }): Promise<UserDocument> {
        // 1. Try to find by provider + providerId
        let user = await this.userModel
            .findOne({ provider: data.provider, providerId: data.providerId })
            .exec();

        // 2. If not found, try matching by email (link accounts)
        if (!user && data.email) {
            user = (await this.userModel.findOne({ email: data.email }).exec()) as any;
            if (user) {
                // Link this social provider to the existing account
                user.provider   = data.provider;
                user.providerId = data.providerId;
                await (user as any).save();
            }
        }

        // 3. Create a brand-new user
        if (!user) {
            user = await this.userModel.create({
                email:      data.email,
                firstName:  data.firstName,
                lastName:   data.lastName,
                provider:   data.provider,
                providerId: data.providerId,
                profile:    { avatarUrl: data.avatarUrl ?? '' },
            });
        }

        return user as UserDocument;
    }
}

