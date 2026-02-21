import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop({ type: Object, default: {} })
    profile: {
        name?: string;
        avatarUrl?: string;
        bio?: string;
    };

    @Prop({ default: 'user' })
    role: string;

    @Prop({ type: [String], default: [] })
    savedPlaces: string[];

    @Prop({ default: 0 })
    karma: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
