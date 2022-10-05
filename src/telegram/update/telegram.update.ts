import { Action, Command, Hears, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import * as dotenv from 'dotenv';
import { UsersService } from '../../users/users.service';
import { Inject } from '@nestjs/common';
import { UsersTokensEnum } from '../../users/enum/users.tokens.enum';
import { CouponsService } from '../../coupons/coupons.service';
import { CouponsTokenEnum } from '../../coupons/enum/tokens/coupons.token.enum';
import { MENULIST } from '../../common/constants';
import { TelegramTokensEnum } from '../enum/tokens/telegram.tokens.enum';
import { TelegramService } from '../telegram.service';

dotenv.config();

@Update()
export class TelegramUpdate {
  constructor(
    @Inject(UsersTokensEnum.USERS_SERVICE_TOKEN)
    private readonly usersService: UsersService,
    @Inject(CouponsTokenEnum.COUPONS_SERVICE_TOKEN)
    private readonly couponsService: CouponsService,
    @Inject(TelegramTokensEnum.TELEGRAM_SERVICE_TOKEN)
    private readonly telegramService: TelegramService,
  ) {}

  @Command('/menu')
  async menu(ctx: Context) {
    await this.telegramService.menu(ctx);
  }

  @Command('/adminmenu')
  async adminMenu(ctx: Context) {
    await (ctx as any).scene.enter('admin-menu');
  }

  @Hears(MENULIST[0])
  async bookEvent(ctx: Context) {
    await this.telegramService.bookEvent(ctx);
  }

  @Hears(MENULIST[1])
  async contacts(ctx: Context) {
    await this.telegramService.contacts(ctx);
  }

  @Hears(MENULIST[2])
  async whatDoWeGot(ctx: Context) {
    await this.telegramService.whatDoWeGot(ctx);
  }

  @Hears(MENULIST[3])
  async getPromoCode(ctx: Context) {
    await this.telegramService.getPromoCode(ctx);
  }

  @Hears(MENULIST[4])
  async orderCall(ctx: Context) {
    await this.telegramService.orderCall(ctx);
  }

  @Command('/sellermenu')
  async sellerMenu(ctx: Context) {
    await (ctx as any).scene.enter('seller-menu');
  }

  @Command('/start')
  async start(ctx: Context) {
    await this.usersService.saveToDb(
      (ctx.update as any)?.message?.from?.id || 0,
    );
    const value = await this.couponsService.getTodayCoupon();
    await ctx.replyWithPhoto(
      'https://telegra.ph/file/2338821e51523163311d5.jpg',
      {
        caption: `Привет!\n\nПодпишитесь на наш канал, чтобы получить промокод\n\n"${value}"!\n\n\nУ нас есть развлечения для каждого ребёнка!`,

        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Подписался', callback_data: 'subscribed' },
              {
                text: 'Подписка',
                url: 'https://t.me/jumpcitybrd',
              },
            ],
          ],
        },
      },
    );
    setTimeout(() => this.telegramService.menu(ctx), 2000);
  }

  @Action('done')
  async done(ctx: Context) {
    try {
      await ctx.editMessageReplyMarkup(null);
    } catch (e) {}
  }

  @Command('/secretcommandtomakeadmin')
  async makeMeAdmin(ctx: Context) {
    await (ctx as any).scene.enter('make-admin');
  }

  @Command('/secretcommandtomakeseller')
  async makeMeSeller(ctx: Context) {
    await (ctx as any).scene.enter('make-seller');
  }

  @Action('subscribed')
  async subscribed(ctx: Context) {
    await ctx.reply('Проверка');
    try {
      const status = (
        await ctx.telegram.getChatMember(process.env.CHANNEL, ctx.from.id)
      ).status;
      switch (status) {
        case 'member':
        case 'administrator':
        case 'creator': {
          await this.couponsService.giveCoupon(ctx);
          break;
        }
        default: {
          await ctx.reply(
            'Вы не подписались... Но не беда!\nВам не обязателен промокод, чтобы посмотреть, что мы можем вам предложить!',
          );
          await this.telegramService.menu(ctx);
          break;
        }
      }
    } catch (e) {
      console.log(e);
      await ctx.reply('Ошибка!');
    }
  }
}
