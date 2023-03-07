import { Context } from 'grammy';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { TelegramUpdate } from '../updates/telegram.update';
import { CANCEL, DIALOGS } from 'src/common/texts';
import { generateCode } from 'src/common/utils';
import { addDays } from 'date-fns';
import { menuKeyboardFunc } from '../utility/telegramMenuUtility';
import { codesCreate } from './codes-create.conversation';
import { codesChange } from './codes-change.conversation';
import { codesDelete } from './codes-delete.conversation';

type MyConversation = Conversation<MyContext>;
type MyContext = Context & ConversationFlavor;

export async function codesCheck(
	this: TelegramUpdate,
	conversation: MyConversation,
	ctx: MyContext,
) {
	const codes = await conversation.external(async () => {
		return await this.codesService.getAllUnexpiredCodesFormatted();
	});
	const options = Object.values(DIALOGS.CODES.OPTIONS);
	const func = async () => {
		await ctx
			.reply(codes.join('\n') || DIALOGS.CODES.ALL.Q1, {
				reply_markup: {
					keyboard: [
						[
							{ text: 'Изменить код' },
							{ text: 'Удалить код' },
							{ text: 'Создать код' },
						],
						[{ text: CANCEL }],
					],
					resize_keyboard: true,
				},
			})
			.catch((e) => undefined);
	};
	func();
	const answer = await conversation.form.select(options, func);
	switch (answer) {
		case DIALOGS.CODES.OPTIONS.CREATE: {
			await codesCreate.call(this, conversation, ctx);
			break;
		}
		case DIALOGS.CODES.OPTIONS.CHANGE: {
			await codesChange.call(this, conversation, ctx);
			break;
		}
		case DIALOGS.CODES.OPTIONS.DELETE: {
			await codesDelete.call(this, conversation, ctx);
			break;
		}
	}
	return codesCheck.call(this, conversation, ctx);
}
