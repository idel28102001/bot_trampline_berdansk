import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UsersProvider } from './users.provider';
import { UsersTokensEnum } from './enum/users.tokens.enum';

@Module({
  imports: [DatabaseModule],
  providers: UsersProvider,
  exports: [UsersTokensEnum.USERS_SERVICE_TOKEN],
})
export class UsersModule {}
