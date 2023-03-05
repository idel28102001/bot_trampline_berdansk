import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from '../common/config';
import { NestjsGrammyModule } from '@grammyjs/nestjs';
import { TelegramProvider } from './telegram.provider';
import { UsersCenterModule } from '../users-center/users-center.module';
import { TelegramTokenEnum } from './enums/tokens/telegram.token.enum';
import { TextsModule } from '../texts/texts.module';
import { CouponsModule } from '../coupons/coupons.module';
import { EventsModule } from '../events/events.module';
import { CodesModule } from 'src/codes/codes.module';

@Module({
	imports: [
		EventsModule,
		TextsModule,
		UsersCenterModule,
		CouponsModule,
		CodesModule,
		ConfigModule.forRoot(),
		DatabaseModule,
		NestjsGrammyModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async () => ({
				token: config.get<string>('TOKEN'),
			}),
			inject: [ConfigService],
		}),
	],
	providers: TelegramProvider,
	exports: [TelegramTokenEnum.TELEGRAM_SERVICES_TOKEN],
})
export class TelegramModule {}
