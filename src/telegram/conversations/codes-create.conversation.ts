import { Context } from 'grammy';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { TelegramUpdate } from '../updates/telegram.update';
import { CANCEL, DIALOGS } from 'src/common/texts';
import { generateCode } from 'src/common/utils';
import { addDays } from 'date-fns';
import { menuKeyboardFunc } from '../utility/telegramMenuUtility';

type MyConversation = Conversation<MyContext>;
type MyContext = Context & ConversationFlavor;

export async function codesCreate(
	this: TelegramUpdate,
	conversation: MyConversation,
	ctx: MyContext,
) {
	const dialog = DIALOGS.CODES.CREATE_CODE;
	const keybA1 = {
		reply_markup: {
			keyboard: [[{ text: CANCEL }]],
			resize_keyboard: true,
		},
	};
	await ctx.reply(dialog.Q1, keybA1).catch((e) => undefined);
	const {
		message: { text: title },
	} = await conversation.waitFor('message:text', async (ctx: MyContext) => {
		await ctx.reply(dialog.Q1, keybA1).catch((e) => undefined);
	});
	const resFunc = async <T>(
		dialogText: string,
		keybA2,
		defaultValue = null,
	): Promise<T> => {
		await ctx.reply(dialogText, keybA2).catch((e) => undefined);
		const {
			message: { text },
		} = await conversation.waitFor(
			'message:text',
			async (ctx: MyContext) => {
				await ctx.reply(dialogText, keybA2).catch((e) => undefined);
			},
		);
		const result = text === DIALOGS.CODES.NEXT.A1 ? defaultValue : text;
		if (typeof defaultValue === 'number') {
			if (isNaN(result))
				return await resFunc(dialogText, keybA2, defaultValue);
			return Number(result) as T;
		}
		return result;
	};
	const keybA2 = {
		reply_markup: {
			keyboard: [[{ text: DIALOGS.CODES.NEXT.A1 }], [{ text: CANCEL }]],
			resize_keyboard: true,
		},
	};
	const description = await resFunc<string>(dialog.Q2, keybA2);
	const expiration = await resFunc<number>(dialog.Q3, keybA2, 2);
	const codeF = async (code = undefined) => {
		const codeLength = 9;
		if (code) {
			code = await resFunc<string>(
				dialog.Q41(code, codeLength),
				keybA2,
				generateCode(codeLength),
			);
		} else {
			code = await resFunc<string>(
				dialog.Q4(codeLength),
				keybA2,
				generateCode(codeLength),
			);
		}
		const isExists = await conversation.external(async () => {
			return await this.codesService.isExist(code);
		});
		if (isExists) return await codeF(code);
		return code;
	};

	const code = await codeF();

	const text = dialog.Q6(title, expiration, code, description);
	const words = Object.values(DIALOGS.CONFIRMATION.KEYBOARD);
	const keyb = {
		reply_markup: {
			keyboard: [words.map((e) => ({ text: e })), [{ text: CANCEL }]],
			resize_keyboard: true,
		},
	};
	await ctx
		.reply(DIALOGS.CONFIRMATION.QUESTIONS.Q2(text), keyb)
		.catch((e) => undefined);
	{
		const result = await conversation.form.select(words, (ctx) =>
			ctx
				.reply(DIALOGS.CONFIRMATION.REASK.A1, keyb)
				.catch((e) => undefined),
		);
		if (result === DIALOGS.CONFIRMATION.KEYBOARD.REEDIT)
			return await codesCreate.call(this, conversation, ctx);
	}
	const result = await conversation.external(async () => {
		const date_expiration = addDays(new Date(), expiration);
		return await this.codesService.codeCreate({
			code,
			date_expiration,
			max_count_use: 1,
			title,
			description,
		});
	});
	const type = (ctx as any).session.role.type;
	if (!result) {
		return await ctx
			.reply(dialog.ER1(code), menuKeyboardFunc(type))
			.catch((e) => undefined);
	}
	return await ctx
		.reply(DIALOGS.CONFIRMATION.QUESTIONS.Q3(text), menuKeyboardFunc(type))
		.catch((e) => undefined);
}
