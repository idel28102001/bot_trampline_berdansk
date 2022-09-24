import { Action, Command, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import * as dotenv from 'dotenv';
import { UsersService } from '../../users/users.service';
import { Inject } from '@nestjs/common';
import { UsersTokensEnum } from '../../users/enum/users.tokens.enum';
import { CouponsService } from '../../coupons/coupons.service';
import { CouponsTokenEnum } from '../../coupons/enum/tokens/coupons.token.enum';

dotenv.config();

@Update()
export class TelegramUpdate {
  constructor(
    @Inject(UsersTokensEnum.USERS_SERVICE_TOKEN)
    private readonly usersService: UsersService,
    @Inject(CouponsTokenEnum.COUPONS_SERVICE_TOKEN)
    private readonly couponsService: CouponsService,
  ) {}

  @Command('/menu')
  async menu(ctx: Context) {
    await (ctx as any).scene.enter('menu');
  }

  @Command('/adminmenu')
  async adminMenu(ctx: Context) {
    await (ctx as any).scene.enter('admin-menu');
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
    await ctx.reply(
      `Приветствую вас!\n\nПодпишитесь на наш канал, чтобы получить промокод\n\n"${value}"!\n\n\nА пока подписываетесь - посмотрите наши предложения и заброниуйте место! /menu`,
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
            'Вы не подписались... Но не беда!\nВам не обязателен промокод, чтобы посмотреть, что мы можем предложить! Введите /menu,что бы ознакомится)',
          );
          break;
        }
      }
    } catch (e) {
      console.log(e);
      await ctx.reply('Ошибка!');
    }
  }
}
