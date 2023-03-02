import { Provider } from '@nestjs/common';
import { DATABASE_SOURCE_TOKEN } from '../database/databse.constant';
import { DataSource } from 'typeorm';
import { EventsTokenEnum } from './enum/tokens/events.token.enum';
import { EventsEntity } from './entities/events.entity';
import { EventsService } from './services/events.service';

export const EventsProvider: Provider[] = [
    {
        provide: EventsTokenEnum.EVENTS_SERVICE_TOKEN,
        useClass: EventsService,
    },
    {
        provide: EventsTokenEnum.EVENTS_REPOSITORY_TOKEN,
        inject: [DATABASE_SOURCE_TOKEN],
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(EventsEntity),
    },
];
