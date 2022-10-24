import { TelegramUpdate } from '../updates/telegram.update';
import { Composer, Context, session, SessionFlavor } from 'grammy';
import {
  ConversationFlavor,
  conversations,
  createConversation,
} from '@grammyjs/conversations';
import { telegramMenuUtility } from '../utility/telegramMenuUtility';
import { CANCEL, MenuButtons } from '../../common/texts';
import { MyContext, SessionData } from '../../common/utils';
import { RolesEnum } from '../../users-center/enums/roles.enum';

export const composer = (thisv2: TelegramUpdate) => {
  const composer = new Composer<
    Context & SessionFlavor<SessionData | any> & ConversationFlavor
  >();
  composer.callbackQuery('done', async (ctx) => {
    try {
      await ctx.editMessageReplyMarkup(null);
    } catch (e) {}
  });
  composer.use(
    session({
      initial: () => ({ role: { type: undefined }, event: undefined }),
    }),
  );
  composer.use(async (ctx: MyContext, next) => {
    if (ctx.chat.type === 'group') {
      return;
    }
    if (!ctx.session.role) {
      const user = await thisv2.usersCenterService.repo.findOne({
        where: { telegramId: ctx.from.id.toString() },
        select: ['id', 'role'],
      });
      if (user) {
        ctx.session.role.type = user.role;
      } else {
        await thisv2.usersCenterService.saveToDBUser(ctx.from);
        ctx.session.role = RolesEnum.USER;
      }
    }
    await next();
  });
  composer.use(conversations());
  composer.hears(CANCEL, async (ctx) => {
    await ctx.conversation.exit();
    await telegramMenuUtility(ctx);
  });
  composer.use(
    createConversation(
      thisv2.telegramService.orderACall.bind(thisv2),
      'order_a_call',
    ),
  );

  composer.use(
    createConversation(thisv2.telegramService.sendContacts, 'send_contacts'),
  );
  composer.use(
    createConversation(
      thisv2.telegramService.makeMeAdmin.bind(thisv2),
      'secretcommandmakeadmin',
    ),
  );

  Object.values(MenuButtons)
    .slice(0, -1)
    .forEach((e) => {
      composer.hears(e, async (ctx) => {
        try {
          ctx.session.event = e;
          await ctx.conversation.enter('order_a_call');
        } catch (e) {}
      });
    });

  composer.hears(MenuButtons.Q7, async (ctx) => {
    try {
      await ctx.conversation.enter('send_contacts');
    } catch (e) {}
  });
  //
  // composer.hears(MenuButtons.Q6, async (ctx) => {
  //   try {
  //     await ctx.conversation.enter('promo');
  //   } catch (e) {}
  // });

  composer.command('secretcommandmakeadmin', async (ctx) => {
    try {
      await ctx.conversation.enter('secretcommandmakeadmin');
    } catch (e) {}
  });

  composer.on('message', async (ctx) => {
    if (!ctx.session.conversation) {
      await telegramMenuUtility(ctx);
    }
  });

  return composer;
};
