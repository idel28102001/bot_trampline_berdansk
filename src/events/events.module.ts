import { Module } from '@nestjs/common';
import { EventsProvider } from './events.provider';
import { DatabaseModule } from '../database/database.module';
import { EventsTokenEnum } from './enum/tokens/events.token.enum';
import { UsersCenterModule } from '../users-center/users-center.module';

@Module({
	imports: [DatabaseModule, UsersCenterModule],
	providers: EventsProvider,
	exports: [EventsTokenEnum.EVENTS_SERVICE_TOKEN],
})
export class EventsModule {}
