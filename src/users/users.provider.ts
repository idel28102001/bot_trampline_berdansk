import { Provider } from '@nestjs/common';
import { DATABASE_SOURCE_TOKEN } from '../database/databse.constant';
import { DataSource } from 'typeorm';
import { UsersTokensEnum } from './enum/users.tokens.enum';
import { UserEntity } from './entities/users.entity';
import { UsersService } from './users.service';

export const UsersProvider: Provider[] = [
  {
    provide: UsersTokensEnum.USERS_SERVICE_TOKEN,
    useClass: UsersService,
  },
  {
    provide: UsersTokensEnum.USERS_REPOSITORY_TOKEN,
    inject: [DATABASE_SOURCE_TOKEN],
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserEntity),
  },
];
