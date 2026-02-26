import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ _id: false })
export class AccessibilitySettings {
    @Prop({ default: false })
    biggerText: boolean;

    @Prop({ default: false })
    dyslexicFont: boolean;

    @Prop({ default: false })
    hideImages: boolean;

    @Prop({ default: false })
    magnifier: boolean;
}


export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true, unique: true, index: true })
    email: string;

    @Prop({ required: false })
    passwordHash: string;

    @Prop()
    resetTokenHash: string;

    @Prop()
    resetTokenExpiry: Date;

    @Prop({ default: 'local' })
    provider: string;   // 'local' | 'google' | 'facebook' | 'apple'

    @Prop()
    providerId: string; // OAuth provider's unique user ID

    @Prop({
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user',
    })
    role: string;

    @Prop({ default: 'en' })
    language: string;

    @Prop({ type: AccessibilitySettings })
    accessibilitySettings: AccessibilitySettings;

    @Prop({ type: Object, default: {} })
    profile: {
        phone?:     string;
        address?:   string;
        city?:      string;
        state?:     string;
        zipCode?:   string;
        avatarUrl?: string;
    };

   
  

}

export const UserSchema = SchemaFactory.createForClass(User);



