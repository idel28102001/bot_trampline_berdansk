import { Provider } from '@nestjs/common';
import { DATABASE_SOURCE_TOKEN } from '../database/databse.constant';
import { DataSource } from 'typeorm';
import { CodesTokenEnum } from './enums/tokens/codes.token.enum';
import { CodesService } from './codes.service';
import { CodesEntity } from './entities/codes.entity';

export const CodesProvider: Provider[] = [
	{
		provide: CodesTokenEnum.CODES_SERVICE_TOKEN,
		useClass: CodesService,
	},
	{
		provide: CodesTokenEnum.CODES_REPOSITORY_TOKEN,
		inject: [DATABASE_SOURCE_TOKEN],
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(CodesEntity),
	},
];
