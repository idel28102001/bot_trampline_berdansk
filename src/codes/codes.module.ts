import { Module } from '@nestjs/common';
import { CodesProvider } from './codes.provider';
import { DatabaseModule } from '../database/database.module';
import { UsersCenterModule } from '../users-center/users-center.module';
import { CodesTokenEnum } from './enums/tokens/codes.token.enum';

@Module({
	imports: [DatabaseModule, UsersCenterModule],
	providers: CodesProvider,
	exports: [CodesTokenEnum.CODES_SERVICE_TOKEN],
})
export class CodesModule {}
