import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { CouponsModule } from './coupons/coupons.module';

@Module({
  imports: [
    TelegramModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    CouponsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
