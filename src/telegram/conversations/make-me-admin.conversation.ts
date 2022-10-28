import { config } from '../../common/config';
import { TelegramUpdate } from '../updates/telegram.update';
import { DIALOGS } from '../../common/texts';
import { MyContext, MyConversation } from '../../common/utils';
import { RolesEnum } from '../../users-center/enums/roles.enum';

export const makeMeAdmin = async (
  conversation: MyConversation,
  ctx: MyContext,
  thisv2: TelegramUpdate,
) => {
  const newCtx = await conversation.waitFor(':text');
  if (newCtx.msg.text === config.getSecret) {
    await conversation.external(async () => {
      await thisv2.usersCenterService.makeAdmin(newCtx.from.id.toString());
    });
    newCtx.session.role.type = RolesEnum.ADMIN;
    await newCtx.reply(DIALOGS.OTHER.ADMIN);
  }
};
