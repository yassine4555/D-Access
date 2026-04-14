import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { User, UserDocument } from '../schemas/user.schema';

type SeedUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'moderator';
};

function getArg(name: string): string | undefined {
  const entry = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return entry ? entry.slice(name.length + 3).trim() : undefined;
}

async function upsertSeedUser(
  userModel: Model<UserDocument>,
  input: SeedUserInput,
): Promise<void> {
  const passwordHash = await bcrypt.hash(input.password, 10);

  await userModel.updateOne(
    { email: input.email.toLowerCase() },
    {
      $set: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email.toLowerCase(),
        passwordHash,
        provider: 'local',
        role: input.role,
      },
      $setOnInsert: {
        language: 'en',
        accessibilitySettings: {
          biggerText: false,
          dyslexicFont: false,
          hideImages: false,
          magnifier: false,
        },
      },
    },
    { upsert: true },
  );
}

async function run(): Promise<void> {
  const adminEmail = getArg('adminEmail') ?? 'admin@daccess.local';
  const adminPassword = getArg('adminPassword') ?? 'Admin123!';
  const moderatorEmail = getArg('moderatorEmail') ?? 'moderator@daccess.local';
  const moderatorPassword = getArg('moderatorPassword') ?? 'Moderator123!';

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

    await upsertSeedUser(userModel, {
      email: adminEmail,
      password: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'admin',
    });

    await upsertSeedUser(userModel, {
      email: moderatorEmail,
      password: moderatorPassword,
      firstName: 'System',
      lastName: 'Moderator',
      role: 'moderator',
    });

    console.log('Seed complete. Admin users ready for moderation API testing:');
    console.log(`- admin: ${adminEmail} / ${adminPassword}`);
    console.log(`- moderator: ${moderatorEmail} / ${moderatorPassword}`);
  } finally {
    await app.close();
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Seed failed:', message);
  process.exit(1);
});
