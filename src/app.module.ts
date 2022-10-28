import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { UsersModule } from './users/users.module';
import { UsersCenterModule } from './users-center/users-center.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { TextsModule } from './texts/texts.module';
import { CouponsModule } from './coupons/coupons.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    DatabaseModule,
    CouponsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TelegramModule,
    UsersModule,
    UsersCenterModule,
    TextsModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
