import { Inject, Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Bot } from 'grammy';
import { UsersCenterService } from '../../users-center/services/users-center.service';
import { UsersCenterTokenEnum } from '../../users-center/enums/tokens/users-center.token.enum';
import { TelegramUpdate } from '../updates/telegram.update';
import { makeMeAdmin } from '../conversations/make-me-admin.conversation';
import { createEvent } from '../conversations/all-meets.conversation';
import { cancelMeet } from '../conversations/cancel-meet.conversation';
import { TextsTokenEnum } from '../../texts/enums/texts.token.enum';
import { TextsService } from '../../texts/services/texts.service';
import { sendContacts } from '../conversations/edit-meet.conversation';
import { consDiagnostic } from '../conversations/cons-diagnostic.conversation';
import { RolesEnum } from '../../users-center/enums/roles.enum';
import { MyContext, MyConversation } from '../../common/utils';
import { config } from '../../common/config';
import { menuKeyboardFunc } from '../utility/telegramMenuUtility';

@Injectable()
export class TelegramService {
  calendar;

  constructor(
    @InjectBot() private readonly bot: Bot,
    @Inject(UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN)
    private readonly usersCenterService: UsersCenterService,
    @Inject(TextsTokenEnum.TEXTS_SERVICES_TOKEN)
    private readonly textsService: TextsService,
  ) {}

  async getWinner(conversation: MyConversation, ctx: MyContext) {
    const thisv2 = this as unknown as TelegramUpdate;
    const users = await conversation.external(async () => {
      const lastEvent = await thisv2.eventsService.getLastEvent();
      return await thisv2.usersCenterService.repo
        .createQueryBuilder('U')
        .leftJoin('U.event', 'event')
        .where('event.id=:eventId', { eventId: lastEvent.id })
        .getMany();
    });
    const text = `Кол-во участвующих ${users.length}\nОтправьте кубик, чтобы найти победителя`;
    await ctx.reply(text, {
      reply_markup: {
        keyboard: [[{ text: '🎲' }, { text: 'Отмена' }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    await conversation.waitFor('message:dice', async (ctx) => {
      await ctx.reply('Отправьте кубик', {
        reply_markup: {
          keyboard: [[{ text: '🎲' }, { text: 'Отмена' }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    });
    const randomIntFromInterval = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1) + min);
    const number = randomIntFromInterval(0, users.length - 1);
    const user = users[number];
    const isSubscribed = await thisv2.eventsService.checkIfSubscribed(
      Object.assign(
        { ...ctx },
        {
          from: {
            id: Number(user.telegramId),
            username: user.username,
            last_name: user.lastname,
            first_name: user.lastname,
          },
        },
      ) as MyContext,
    );
    const name =
      `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Неизвестно';
    const username = user.username ? `@${user.username}` : `Неизвестен`;
    const link = `<a href="tg://user?id=${user.telegramId}">${user.telegramId}</a>`;
    let text2 = `Наш победитель:\nИмя: ${name}\nНикнейм: ${username}\nСсылка: ${link}\nId: ${user.id}\n`;
    if (!isSubscribed) {
      text2 += 'Но к сожалению он не подписан на канал';
    }
    await ctx.reply(text2, {
      ...menuKeyboardFunc(ctx.session.role.type),
      parse_mode: 'HTML',
    });
  }

  async sendContacts(conversation: MyConversation, ctx: MyContext) {
    return await sendContacts(conversation, ctx);
  }

  async subscribeOnChannel(ctx: MyContext) {
    await ctx.reply('Для пользования ботом подпишитесь на канал', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Наш канал',
              url: `https://t.me/${config.get('CHANNEL').slice(1)}`,
            },
          ],
        ],
      },
    });
  }

  async createEvent(conversation: MyConversation, ctx: MyContext) {
    if (ctx.session.role.type !== RolesEnum.ADMIN) {
      return;
    }
    return await createEvent(
      conversation,
      ctx,
      this as unknown as TelegramUpdate,
    );
  }

  async cancelMeet(conversation: MyConversation, ctx: MyContext) {
    return await cancelMeet(
      conversation,
      ctx,
      this as unknown as TelegramUpdate,
    );
  }

  async makeMeAdmin(conversation: MyConversation, ctx: MyContext) {
    return makeMeAdmin(conversation, ctx, this as unknown as TelegramUpdate);
  }

  async orderACall(conversation: MyConversation, ctx: MyContext) {
    // return diagnosticTest(
    //   conversation,
    //   ctx,
    //   this as unknown as TelegramUpdate,
    //   type,
    // );
    return consDiagnostic(conversation, ctx, this as unknown as TelegramUpdate);
  }
}
