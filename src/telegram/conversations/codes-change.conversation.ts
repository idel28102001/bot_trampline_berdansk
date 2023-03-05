import { Context } from 'grammy';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { TelegramUpdate } from '../updates/telegram.update';
import { CANCEL, DIALOGS } from 'src/common/texts';
import { generateCode } from 'src/common/utils';
import { addDays } from 'date-fns';
import { menuKeyboardFunc } from '../utility/telegramMenuUtility';
import { chunk } from 'src/common/constants';

type MyConversation = Conversation<MyContext>;
type MyContext = Context & ConversationFlavor;

export async function codesChange(
	this: TelegramUpdate,
	conversation: MyConversation,
	ctx: MyContext,
) {
	const changeOnes = DIALOGS.CODES.CHANGE_CODE;
	const keyb1 = {
		reply_markup: {
			keyboard: [[{ text: CANCEL }]],
			resize_keyboard: true,
		},
	};
	const delCall = async () =>
		await ctx.reply(changeOnes.Q1, keyb1).catch((e) => undefined);
	delCall();
	const {
		message: { text: code },
	} = await conversation.waitFor('message:text', delCall);
	const codeObj = await conversation.external(async () => {
		return await this.codesService.getCode(code);
	});
	if (!codeObj) return await ctx.reply(changeOnes.Q12);
	const words = Object.values(changeOnes.A1);
	const key1 = {
		reply_markup: {
			keyboard: [...chunk(words, 2), [{ text: CANCEL }]],
			resize_keyboard: true,
		},
	};
	const ask2 = async () => {
		return await ctx
			.reply(
				changeOnes.Q2(codeObj.title, codeObj.code, codeObj.description),
				key1,
			)
			.catch((e) => undefined);
	};
	ask2();
	const opt = await conversation.form.select(words, ask2);
	const curr = async () => {
		return await ctx
			.reply(changeOnes.Q3(opt), keyb1)
			.catch((e) => undefined);
	};
	await curr();
	const {
		message: { text: res },
	} = await conversation.waitFor('message:text', curr);
	const text = changeOnes.Q4(opt, res);
	const repl = DIALOGS.CONFIRMATION.QUESTIONS.Q2(text);
	const wordsKey = Object.values(DIALOGS.CONFIRMATION.KEYBOARD);
	const keyb = {
		reply_markup: {
			keyboard: [wordsKey.map((e) => ({ text: e })), [{ text: CANCEL }]],
			resize_keyboard: true,
		},
	};
	const confAsk = async () => {
		return await ctx.reply(repl, keyb).catch((e) => undefined);
	};
	await confAsk();
	const answ = await conversation.form.select(wordsKey, confAsk);
	const property = changeOnes.A11[opt];
	const answer = await conversation.external(async () => {
		return await this.codesService.changeCode(codeObj.code, property, res);
	});
	const endText = answer
		? changeOnes.Q5(codeObj.code, { property: opt, value: res })
		: changeOnes.Q6(codeObj.code);
	await ctx.reply(endText).catch((e) => undefined);
}
