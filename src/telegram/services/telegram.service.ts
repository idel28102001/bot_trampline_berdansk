import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class TelegramService {
  async sendOrder(
    ctx: Context,
    order: { name: string; phone: string; num: number },
  ) {
    await ctx.telegram.sendMessage(
      process.env.CHATBOOK,
      `Заказ номер: ${order.num}\nИмя: ${order.name}\nТелефон:${order.phone}`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: 'Готово', callback_data: 'done' }]],
        },
      },
    );
  }
}
