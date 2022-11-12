import { MyContext, MyConversation } from '../../common/utils';
import { DIALOGS } from '../../common/texts';
import { config } from '../../common/config';
import { menuKeyboardFunc } from '../utility/telegramMenuUtility';

export const sendContacts = async (
  conversation: MyConversation,
  ctx: MyContext,
) => {
  await ctx.replyWithLocation(
    46.76090741432438,
    36.79271353331825,
    menuKeyboardFunc(ctx.session.role.type),
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
