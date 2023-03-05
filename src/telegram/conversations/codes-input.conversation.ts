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

export async function codesInput(
	this: TelegramUpdate,
	conversation: MyConversation,
	ctx: MyContext,
) {
	const deleteOnes = DIALOGS.CODES.INPUT_CODE;
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
	const currCode = await conversation.external(async () => {
		return await this.codesService.checkItAndAsign(
			ctx.from.id.toString(),
			code,
		);
	});
	const text = currCode
		? deleteOnes.Q2(currCode.title, currCode.description)
		: 'Код уже использован или недействителен';
	const type = (ctx as any).session.role.type;
	await ctx.reply(text, menuKeyboardFunc(type)).catch((e) => undefined);
}
