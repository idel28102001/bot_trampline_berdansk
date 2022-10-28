import { Inject, Injectable } from '@nestjs/common';
import { EventsTokenEnum } from '../enum/tokens/events.token.enum';
import { Repository } from 'typeorm';
import { EventsEntity } from '../entities/events.entity';
import { MyContext } from '../../common/utils';
import { UsersCenterService } from '../../users-center/services/users-center.service';
import { UsersCenterTokenEnum } from '../../users-center/enums/tokens/users-center.token.enum';
import { config } from '../../common/config';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EventsTokenEnum.EVENTS_REPOSITORY_TOKEN)
    private readonly eventRepo: Repository<EventsEntity>,
    @Inject(UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN)
    private readonly usersCenterService: UsersCenterService,
  ) {}

  async getLastEvent() {
    return await this.eventRepo.findOne({
      order: { id: 'DESC' },
      where: { relative: true },
    });
  }

  async currEvent(ctx: MyContext) {
    let user = await this.usersCenterService.repo
      .createQueryBuilder('U')
      .leftJoin('U.event', 'E')
      .where('U.telegramId=:telegramId', { telegramId: ctx.from.id.toString() })
      .select(['U.id', 'E.id'])
      .getOne();
    if (!user) {
      await this.usersCenterService.saveToDBUser(ctx.from);
      user = await this.usersCenterService.repo
        .createQueryBuilder('U')
        .leftJoin('U.event', 'E')
        .where('U.telegramId=:telegramId', {
          telegramId: ctx.from.id.toString(),
        })
        .select(['U.id', 'E.id'])
        .getOne();
    }
    const result = await ctx.api
      .getChatMember(config.get('CHANNEL'), ctx.from.id)
      .catch((e) => ({ status: 'left' }));
    const event = await this.eventRepo.findOne({
      order: { id: 'DESC' },
      where: { relative: true },
    });
    if (user.event && user.event.id === event.id) {
      await ctx.answerCallbackQuery({
        text: 'Вы уже участвуете',
        show_alert: true,
        cache_time: 10,
      });
    } else {
      switch (result.status) {
        case 'restricted':
        case 'left':
        case 'kicked': {
          await ctx.answerCallbackQuery({
            text: 'Подпишитесь на канал',
            show_alert: true,
            cache_time: 10,
          });
          return;
        }
      }
      user.event = event;
      await this.usersCenterService.repo.save(user);
      await ctx.answerCallbackQuery({
        text: 'Вы теперь участвуете',
        show_alert: true,
        cache_time: 10,
      });
    }
  }

  async createEvent({
    messageId,
    text,
    releaseDate,
  }: {
    messageId: number;
    text: string;
    releaseDate: Date;
  }) {
    const element = this.eventRepo.create({
      messageId,
      name: text,
      dateToRelease: releaseDate,
    });
    await this.eventRepo.save(element);
  }
}
