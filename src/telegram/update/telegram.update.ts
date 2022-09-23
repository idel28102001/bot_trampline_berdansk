import { Action, Command, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import * as dotenv from 'dotenv';
import { UsersService } from '../../users/services/users.service';

dotenv.config();

@Update()
export class TelegramUpdate {
  constructor(private readonly usersService: UsersService) {}

  @Command('/menu')
  async menu(ctx: Context) {
    await (ctx as any).scene.enter('menu');
  }

  @Command('/start')
  async start(ctx: Context) {
    await this.usersService.saveToDb(
      (ctx.update as any)?.message?.from?.id || 0,
    );

    await ctx.reply(
      'Приветствую вас! Подпишитесь на наш канал, чтобы получить промокод на бесплатное посещение при покупке абонимента!',
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Подписался', callback_data: 'subscribed' },
              {
                text: 'Подписка',
                url: 'https://t.me/+5P8-nkCW6HwxYTNi',
              },
            ],
          ],
        },
      },
    );
  }

  @Action('done')
  async done(ctx: Context) {
    try {
      await ctx.editMessageReplyMarkup(null);
    } catch (e) {}
  }

  @Action('subscribed')
  async subscribed(ctx: Context) {
    await ctx.reply('Проверка');
    const status = (
      await ctx.telegram.getChatMember(process.env.CHANNEL, ctx.from.id)
    ).status;
    switch (status) {
      case 'member':
      case 'administrator':
      case 'creator': {
        await ctx.reply('Вы подписались! Вот ваш промокод "Семья"!');
        break;
      }
      default: {
        await ctx.reply('Вы не подписались...');
        break;
      }
    }
  }
}
