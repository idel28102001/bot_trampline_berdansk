import { CANCEL, DIALOGS, MenuButtons } from '../../common/texts';
import { chunk } from '../../common/constants';
import { RolesEnum } from '../../users-center/enums/roles.enum';
import { MyContext } from '../../common/utils';

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
export const menuKeyboardFunc = (role: RolesEnum) => {
  const keyboard = [
    [{ text: MenuButtons.Q0 }],
    ...chunk(
      Object.values(MenuButtons)
        .slice(1, -1)
        .map((e) => ({ text: e })),
      2,
    ),
  ];
  if (role === RolesEnum.ADMIN) {
    keyboard.unshift([{ text: MenuButtons.Q8 }]);
  }
  return {
    reply_markup: {
      keyboard,
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
};

export const telegramMenuUtility = async (ctx: MyContext) => {
  await ctx.reply(
    'Что именно ты хочешь?',
    menuKeyboardFunc(ctx.session.role.type),
  ).catch(e=>undefined);
};
