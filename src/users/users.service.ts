import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from './entities/users.entity';
import { Repository } from 'typeorm';
import { UsersTokensEnum } from './enum/users.tokens.enum';
import { UsersRole } from './enum/users.role';

@Injectable()
export class UsersService {
  constructor(
    @Inject(UsersTokensEnum.USERS_REPOSITORY_TOKEN)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  get repo() {
    return this.usersRepo;
  }

  async checkAdminRights(telegramId: number) {
    try {
      return await this.usersRepo.findOneOrFail({
        where: {
          telegramId: String(telegramId),
          role: UsersRole.ADMIN,
        },
        select: ['id'],
      });
    } catch (e) {}
  }

  async checkSellerRights(telegramId: number) {
    try {
      return await this.usersRepo
        .createQueryBuilder('U')
        .where('U.telegramId=:telegramId', { telegramId: String(telegramId) })
        .orWhere('U.role=:role', { role: UsersRole.SELLER })
        .orWhere('U.role=:role2', { role2: UsersRole.ADMIN })
        .getOneOrFail();
    } catch (e) {}
  }

  async makeAdmin(telegramId: number) {
    await this.usersRepo.update(
      {
        telegramId: String(telegramId),
      },
      { role: UsersRole.ADMIN },
    );
  }

  async saveToDb(telegramId: number) {
    const tel = String(telegramId);
    await this.usersRepo
      .createQueryBuilder('U')
      .insert()
      .into(UserEntity)
      .values({ telegramId: tel })
      .orIgnore()
      .execute();
  }
}
