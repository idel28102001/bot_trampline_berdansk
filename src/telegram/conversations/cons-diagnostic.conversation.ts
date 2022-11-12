import { TelegramUpdate } from '../updates/telegram.update';
import {
  choose,
  formatPhone,
  MyContext,
  MyConversation,
} from '../../common/utils';
import { CANCEL, DIALOGS, MenuButtons } from '../../common/texts';
import { Keyboard } from 'grammy';
import { cancelKeyboard } from '../../common/constants';
import {
  confirmKeyboard,
  menuKeyboardFunc,
  telegramMenuUtility,
} from '../utility/telegramMenuUtility';
import { config } from '../../common/config';

export const consDiagnostic = async (
  conversation: MyConversation,
  ctx: MyContext,
  thisv2: TelegramUpdate,
) => {
  let dateEvent: string;
  switch (ctx.session.event) {
    case MenuButtons.Q1: {
      dateEvent = await thisv2.textsService.getTimes(conversation, ctx);
      break;
    }
    case MenuButtons.Q5:
    case MenuButtons.Q4: {
      dateEvent = await thisv2.textsService.getSpecificDates(
        conversation,
        ctx,
        [2, 4],
      );
      break;
    }
    case MenuButtons.Q6: {
      const words = DIALOGS.MEETINGS.EVENT;
      await ctx.reply(DIALOGS.MEETINGS.EVENT.A1, {
        reply_markup: {
          keyboard: [[{ text: words.Q1 }, { text: words.Q2 }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      const result = await conversation.form.select([words.Q1, words.Q2]);
      if (result === words.Q2) {
        await ctx.reply(words.A2, menuKeyboardFunc(ctx.session.role.type));
        return;
      }
    }
    default: {
      dateEvent = await thisv2.textsService.getSpecificDates(conversation, ctx);
    }
  }
  const forPhone = DIALOGS.MEETINGS.CREATE.PHONE_NUMBER;
  const keyboardForPhone = new Keyboard()
    .requestContact(forPhone.SHARE)
    .text(CANCEL);
  const forPhoneKey = {
    reply_markup: {
      keyboard: keyboardForPhone.build(),
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
  await ctx.reply(forPhone.ACTION(), forPhoneKey);
  const { msg } = await conversation.waitFor(
    ['message:contact', '::phone_number'],
    async (ctx: MyContext) => {
      await ctx.reply(
        DIALOGS.MEETINGS.CREATE.PHONE_NUMBER.ACTION(),
        forPhoneKey,
      );
    },
  );
  const phoneNum = msg.text ? msg.text : msg.contact.phone_number;
  const phoneNumber = formatPhone(phoneNum);
  await ctx.reply(DIALOGS.MEETINGS.CREATE.COMMENT.Q1, {
    reply_markup: {
      keyboard: [
        [{ text: DIALOGS.MEETINGS.CREATE.COMMENT.KEYBOARD.TYPESMTH }],
        [
          { text: DIALOGS.MEETINGS.CREATE.COMMENT.KEYBOARD.EMPTY },
          { text: CANCEL },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
  const {
    msg: { text: addComment },
  } = await conversation.waitFor('message:text');
  let comment = '';

  switch (addComment) {
    case DIALOGS.MEETINGS.CREATE.COMMENT.KEYBOARD.EMPTY: {
      break;
    }
    case DIALOGS.MEETINGS.CREATE.COMMENT.KEYBOARD.TYPESMTH: {
      await ctx.reply('Напишите комментарий к встрече', cancelKeyboard);
      comment = await conversation.form.text((ctx: MyContext) =>
        ctx.reply(DIALOGS.MEETINGS.CREATE.COMMENT.ACTION),
      );
      break;
    }
    default: {
      comment = addComment;
    }
  }

  const cText = DIALOGS.MEETINGS.CREATE.ALL.WHOLE_TEXT;

  let resText = `${cText.P1}\n${cText.P2} ${ctx.session.event}\n${
    dateEvent ? dateEvent + '\n' : ''
  }${cText.P3} ${phoneNumber}`;
  resText = comment ? `${resText}\n${cText.P4} ${comment}` : resText;

  await ctx.reply(
    `${resText}\n\n${DIALOGS.CONFIRMATION.QUESTIONS.Q1}`,
    confirmKeyboard,
  );
  const answer = await conversation.form.select(
    Object.values(DIALOGS.CONFIRMATION.KEYBOARD),
    choose,
  );
  switch (answer) {
    case DIALOGS.CONFIRMATION.KEYBOARD.CONFIRM: {
      const obj = {
        from: ctx.from,
        comment,
        phoneNumber,
        event: ctx.session.event,
      };
      const text = thisv2.textsService.prepareToChat(obj, dateEvent);
      await ctx.api
        .sendMessage(config.getBook, text, {
          reply_markup: {
            inline_keyboard: [[{ text: 'Готово', callback_data: 'done' }]],
          },
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        })
        .catch((e) => {
          console.log(e);
        });
      await ctx.reply(
        DIALOGS.MEETINGS.CREATE.ALL.A1,
        menuKeyboardFunc(ctx.session.role.type),
      ); //TEST
      return;
    }
    case DIALOGS.CONFIRMATION.KEYBOARD.REEDIT: {
      return await telegramMenuUtility(ctx);
    }
  }
};
