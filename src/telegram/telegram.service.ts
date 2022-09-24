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
    await ctx.telegram.sendMessage(
      process.env.CHATBOOK,
      `Заказ номер: ${order.num}\nИмя: ${order.name}\nТелефон:${
        order.phone
      }\nЗапрос: ${order.event.slice(2)}`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: 'Готово', callback_data: 'done' }]],
        },
      },
    );
  }
}
