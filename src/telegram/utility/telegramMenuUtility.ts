import { Context } from 'grammy';
import { CANCEL, DIALOGS, MenuButtons } from '../../common/texts';
import { chunk } from '../../common/constants';

export const confirmKeyboard = {
  reply_markup: {
    keyboard: [
      [
        { text: DIALOGS.CONFIRMATION.KEYBOARD.CONFIRM },
        { text: DIALOGS.CONFIRMATION.KEYBOARD.REEDIT },
        { text: CANCEL },
      ],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

export const menuKeyboard = {
  reply_markup: {
    keyboard: chunk(
      Object.values(MenuButtons).map((e) => ({ text: e })),
      2,
    ),

    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

export const telegramMenuUtility = async (ctx: Context) => {
  await ctx.reply('Что именно ты хочешь?', menuKeyboard);
};
