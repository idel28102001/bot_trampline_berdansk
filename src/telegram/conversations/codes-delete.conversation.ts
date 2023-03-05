import { Context } from 'grammy';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { TelegramUpdate } from '../updates/telegram.update';
import { CANCEL, DIALOGS } from 'src/common/texts';
import { generateCode } from 'src/common/utils';
import { addDays, differenceInDays, subDays } from 'date-fns';
import { menuKeyboardFunc } from '../utility/telegramMenuUtility';

type MyConversation = Conversation<MyContext>;
type MyContext = Context & ConversationFlavor;

export async function codesDelete(
	this: TelegramUpdate,
	conversation: MyConversation,
	ctx: MyContext,
) {
	const deleteOnes = DIALOGS.CODES.DELETE_CODE;
	const keyb1 = {
		reply_markup: {
			keyboard: [[{ text: CANCEL }]],
			resize_keyboard: true,
		},
	};
	const delCall = async () =>
		await ctx.reply(deleteOnes.Q1, keyb1).catch((e) => undefined);
	delCall();
	const {
		message: { text: code },
	} = await conversation.waitFor('message:text', delCall);
	const codeObj = await conversation.external(async () => {
		return await this.codesService.getCode(code);
	});
	if (!codeObj) return await ctx.reply(deleteOnes.Q12);
	const expiration = differenceInDays(
		codeObj.date_expiration,
		codeObj.createdAt,
	);
	const lastsDays = differenceInDays(codeObj.date_expiration, new Date());
	const text = DIALOGS.CODES.CREATE_CODE.Q6(
		codeObj.title,
		`${expiration}(${lastsDays})`,
		codeObj.code,
		codeObj.description,
	);
	const words = Object.values(DIALOGS.CONFIRMATION.KEYBOARD_YN);
	const keyb2 = {
		reply_markup: {
			keyboard: [words.map((e) => ({ text: e })), [{ text: CANCEL }]],
			resize_keyboard: true,
		},
	};
	const delAsk1 = async () => {
		return await ctx
			.reply(DIALOGS.CONFIRMATION.QUESTIONS.Q22(text), keyb2)
			.catch((e) => undefined);
	};
	await delAsk1();
	const opti = await conversation.form.select(words, delAsk1);
	if (opti === DIALOGS.CONFIRMATION.KEYBOARD_YN.N) return;
	const res = await conversation.external(async () => {
		return await this.codesService.deleteCode(codeObj);
	});
	const text2 = res
		? deleteOnes.Q2(codeObj.code)
		: deleteOnes.Q3(codeObj.code);
	await ctx.reply(text2).catch((e) => undefined);
}
