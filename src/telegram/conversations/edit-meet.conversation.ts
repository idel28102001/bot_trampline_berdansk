import { MyContext, MyConversation } from '../../common/utils';
import { DIALOGS } from '../../common/texts';
import { menuKeyboard } from '../utility/telegramMenuUtility';
import { config } from '../../common/config';

export const sendContacts = async (
  conversation: MyConversation,
  ctx: MyContext,
) => {
  await ctx.replyWithLocation(
    46.76090741432438,
    36.79271353331825,
    menuKeyboard,
  );
  await ctx.reply(DIALOGS.LOCATION.A1, {
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
};
