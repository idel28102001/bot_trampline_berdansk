import { TelegramUpdate } from '../updates/telegram.update';
import { MyContext, MyConversation } from '../../common/utils';
import { config } from '../../common/config';
import { parse } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CANCEL } from '../../common/texts';

export const createEvent = async (
	conversation: MyConversation,
	ctx: MyContext,
	thisv2: TelegramUpdate,
) => {
	await ctx
		.reply('Введите дату в формате дд-мм-гггг чч:мм', {
			reply_markup: {
				keyboard: [[{ text: CANCEL }]],
				resize_keyboard: true,
				one_time_keyboard: true,
			},
		})
		.catch((e) => undefined);
	let currTime;
	while (true) {
		currTime = await conversation.form.text();
		if (!/\d{2}-\d{2}-\d{4} \d{2}:\d{2}/.test(currTime)) {
			await ctx
				.reply('Введите дату в формате дд-мм-гггг чч:мм')
				.catch((e) => undefined);
		} else {
			break;
		}
	}
	const releaseDate = parse(currTime, 'dd-MM-yyyy kk:mm', new Date(), {
		locale: ru,
	});
	await ctx
		.reply('Введите текст розыгрыша', {
			reply_markup: {
				keyboard: [[{ text: CANCEL }]],
				resize_keyboard: true,
				one_time_keyboard: true,
			},
		})
		.catch((e) => undefined);
	const currText = await conversation.form.text(async (ctx) => {
		await ctx
			.reply('Введите текст розыгрыша', {
				reply_markup: {
					keyboard: [[{ text: CANCEL }]],
					resize_keyboard: true,
					one_time_keyboard: true,
				},
			})
			.catch((e) => undefined);
	});
	const result = await ctx.api.sendMessage(config.get('CHANNEL'), currText, {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: 'Участвовать',
						callback_data: 'curr_event',
					},
				],
			],
		},
	});
	await conversation.external(async () => {
		await thisv2.eventsService
			.createEvent({
				messageId: result.message_id,
				text: currText,
				releaseDate,
			})
			.catch((e) => console.log(e));
	});
};
