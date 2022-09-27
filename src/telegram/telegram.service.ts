import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';

@Injectable()
export class TelegramService {
  constructor() {}

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
