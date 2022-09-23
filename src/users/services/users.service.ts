import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
  ) {}

  async saveToDb(telegramId: number) {
    const tel = String(telegramId);
    await this.userEntity
      .createQueryBuilder('U')
      .insert()
      .into(UserEntity)
      .values({ telegramId: tel })
      .orIgnore()
      .execute();
  }
}
