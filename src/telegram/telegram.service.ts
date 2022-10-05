import { Inject, Injectable } from '@nestjs/common';
import { Context, Scenes } from 'telegraf';
import { KEYBOARD_MENU, MENULIST } from '../common/constants';
import { CouponsTokenEnum } from '../coupons/enum/tokens/coupons.token.enum';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class TelegramService {
  constructor(
    @Inject(CouponsTokenEnum.COUPONS_SERVICE_TOKEN)
    private readonly couponsService: CouponsService,
  ) {}

  async menu(ctx: Context) {
    await ctx.replyWithPhoto(
      'https://telegra.ph/file/df62280c6631e7f6f6977.jpg',
      {
        caption: `Выберите, что вам требуется:\n\n${MENULIST.join('\n')}`,
        reply_markup: {
          keyboard: KEYBOARD_MENU,
          resize_keyboard: true,
        },
      },
    );
  }

  async confirmOrNot(ctx: Scenes.WizardContext) {
    const cntx = ctx as any;
    const event = cntx.session.event
      ? cntx.session.event.slice(2)
      : 'Заказать звонок';
    const mess = `Ваше имя: ${(ctx as any).session.name}\nВаш номер телефона: ${
      cntx.session.phone
    }\nВы хотите: ${event}`;
    await ctx.replyWithPhoto(
      'https://telegra.ph/file/d99e7462f6dad57d84ddc.jpg',
      {
        caption: `${mess}\n\nВы подтверждаете?`,
        reply_markup: {
          one_time_keyboard: true,
          resize_keyboard: true,
          keyboard: [
            [{ text: 'Да' }, { text: 'Переделать' }, { text: 'Отмена' }],
          ],
        },
      },
    );
  }

  async bookEvent(ctx: Context) {
    await (ctx as any).scene.enter('book-event');
  }

  async contacts(ctx: Context) {
    await ctx.replyWithPhoto(
      'https://telegra.ph/file/ca298582542555bb19a77.jpg',
      {
        caption:
          `Наши контакты:\n${process.env.CONTACTS.split('\\n').join('\n')}` +
          `\n\nМы находимся по адресу:\n${process.env.ADRESS}`,
        reply_markup: {
          keyboard: KEYBOARD_MENU,
          resize_keyboard: true,
        },
      },
    );
  }

  async whatDoWeGot(ctx: Context) {
    await ctx.replyWithPhoto(
      'https://scontent-ams2-1.cdninstagram.com/v/t51.2885-15/297333758_1911665445696768_2324495819146856463_n.webp?stp=dst-jpg_e35&_nc_ht=scontent-ams2-1.cdninstagram.com&_nc_cat=100&_nc_ohc=NOElGD2cEjMAX-jJ9g2&edm=ALQROFkBAAAA&ccb=7-5&ig_cache_key=Mjg5NzQwMzc2NTcyMDgzODcxMA%3D%3D.2-ccb7-5&oh=00_AT9paCc56GJkaNNhEqQ0JmcmABNcHzQefszscUBZIlHbhw&oe=63395747&_nc_sid=30a2ef',
      {
        caption:
          'В центре есть:\n\n' +
          '🧶Батуты\n' +
          '🎲 Лабиринт с бассейном из шариков \n' +
          '🎮 Игры на ХВОХ\n' +
          '🥳️ Развлекательные программы для малышей \n' +
          '☁ Большая мягкая зона \n' +
          '🤹‍♀️Аниматоры, и многое другое \n',
        reply_markup: {
          keyboard: KEYBOARD_MENU,
          resize_keyboard: true,
        },
      },
    );
  }

  async getPromoCode(ctx: Context) {
    const subed = await this.checkIfSubscibed(ctx);
    if (!subed) {
      await ctx.reply(
        'Для получения промокода нужно быть подписаным на наш канал',
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Подписаться',
                  url: 'https://t.me/jumpcitybrd',
                },
              ],
            ],
          },
        },
      );
      return;
    }
    await this.couponsService.giveCoupon(ctx);
  }

  async orderCall(ctx: Context) {
    await (ctx as any).scene.enter('order-call');
  }

  async checkIfSubscibed(ctx: Context) {
    const status = (
      await ctx.telegram.getChatMember(process.env.CHANNEL, ctx.from.id)
    ).status;
    switch (status) {
      case 'member':
      case 'administrator':
      case 'creator': {
        return true;
      }
      default: {
        return false;
      }
    }
  }

  async sendOrder(
    ctx: Context,
    order: { name: string; phone: string; num: number; event: string },
  ) {
    const cntx = ctx as any;
    const event = cntx.session.event
      ? cntx.session.event.slice(2)
      : 'Заказать звонок';
    await ctx.telegram.sendMessage(
      process.env.CHATBOOK,
      `Заказ номер: ${order.num}\nИмя: ${order.name}\nТелефон:${order.phone}\nЗапрос: ${event}`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: 'Готово', callback_data: 'done' }]],
        },
      },
    );
  }
}
