import { TelegramUpdate } from '../updates/telegram.update';
import { MyContext, MyConversation } from '../../common/utils';

export const promo = async (
  conversation: MyConversation,
  ctx: MyContext,
  thisv2: TelegramUpdate,
) => {
  await ctx.reply('Получить промокод');
};
