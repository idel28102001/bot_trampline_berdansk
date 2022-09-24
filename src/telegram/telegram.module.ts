import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { UsersModule } from '../users/users.module';
import { DatabaseModule } from '../database/database.module';
import { TelegramProvider } from './telegram.provider';
import { TelegramTokensEnum } from './enum/tokens/telegram.tokens.enum';
import { CouponsModule } from '../coupons/coupons.module';

dotenv.config();

@Module({
  imports: [
    DatabaseModule,
    TelegrafModule.forRoot({
      token: process.env.TOKEN,
      middlewares: [session()],
    }),
    UsersModule,
    CouponsModule,
  ],
  providers: TelegramProvider,
  exports: [TelegramTokensEnum.TELEGRAM_SERVICE_TOKEN],
})
export class TelegramModule {}
