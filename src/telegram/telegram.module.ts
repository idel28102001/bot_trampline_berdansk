import { Module } from '@nestjs/common';
import { TelegramService } from './services/telegram.service';
import * as dotenv from 'dotenv';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramUpdate } from './update/telegram.update';
import { MenuWizard } from './wizards/menu.wizard';
import { session } from 'telegraf';
import { UsersModule } from '../users/users.module';

dotenv.config();

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TOKEN,
      middlewares: [session()],
    }),
    UsersModule,
  ],
  providers: [TelegramService, TelegramUpdate, MenuWizard],
})
export class TelegramModule {}
