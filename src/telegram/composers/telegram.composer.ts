import { TelegramUpdate } from '../updates/telegram.update';
import { Composer, Context, session, SessionFlavor } from 'grammy';
import {
	ConversationFlavor,
	conversations,
	createConversation,
} from '@grammyjs/conversations';
import { telegramMenuUtility } from '../utility/telegramMenuUtility';
import { CANCEL, MenuButtons, MenuAdminButtons } from '../../common/texts';
import { MyContext, SessionData } from '../../common/utils';
import { RolesEnum } from '../../users-center/enums/roles.enum';
import { config } from '../../common/config';
import e from 'express';

export const composer = (thisv2: TelegramUpdate) => {
	const composer = new Composer<
		Context & SessionFlavor<SessionData | any> & ConversationFlavor
	>();
	composer.callbackQuery('done', async (ctx) => {
		try {
			await ctx.editMessageReplyMarkup(null).catch((e) => undefined);
		} catch (e) {}
	});
	composer.use(
		session({
			initial: () => ({ role: { type: undefined }, event: undefined }),
		}),
	);
	composer.use(async (ctx: MyContext, next) => {
		switch (ctx.chat.type) {
			case 'channel':
			case 'supergroup':
			case 'group': {
				if (!ctx.update.callback_query) {
					return;
				}
			}
		}
		if (!ctx.session.role.type) {
			const admins = JSON.parse(`\"${process.env.ADMINS}\"` || '[]');
			const adminsIds = JSON.parse(
				`\"${process.env.ADMINS_IDS}\"` || '[]',
			);
			const isSubscribed = await thisv2.eventsService.checkIfSubscribed(
				ctx,
			);
			if (!isSubscribed) {
				await thisv2.telegramService.subscribeOnChannel(ctx);
				return;
			}
			const user = await thisv2.usersCenterService.repo.findOne({
				where: { telegramId: ctx.from.id.toString() },
				select: ['id', 'role'],
			});
			if (user) {
				if (
					admins.includes(ctx.from.username) ||
					adminsIds.includes(ctx.from.id)
				) {
					ctx.session.role.type = RolesEnum.ADMIN;
				} else {
					ctx.session.role.type = user.role;
				}
			} else {
				await thisv2.usersCenterService.saveToDBUser(ctx.from);
				ctx.session.role.type = RolesEnum.USER;
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
		createConversation(
			thisv2.telegramService.codesCheck.bind(thisv2),
			'codes_check',
		),
	);
	composer.use(
		createConversation(
			thisv2.telegramService.codesInput.bind(thisv2),
			'codes_input',
		),
	);

	composer.use(
		createConversation(
			thisv2.telegramService.sendContacts,
			'send_contacts',
		),
	);

	composer.callbackQuery('curr_event', async (ctx) => {
		await thisv2.eventsService.currEvent(ctx);
	});

	composer.use(
		createConversation(
			thisv2.telegramService.createEvent.bind(thisv2),
			'create_event',
		),
	);
	composer.use(
		createConversation(
			thisv2.telegramService.getWinner.bind(thisv2),
			'get_winner',
		),
	);
	composer.use(
		createConversation(
			thisv2.telegramService.makeMeAdmin.bind(thisv2),
			'secretcommandmakeadmin',
		),
	);
	composer.hears(MenuButtons.Q0, async (ctx) => {
		try {
			const event = await thisv2.eventsService.getLastEvent();
			if (!event) {
				await ctx
					.reply('Пока никаких розыгрышев нет')
					.catch((e) => undefined);
				return;
			}
			await ctx.reply(
				'Розыгрыш проходит в канале - переходите и участвуйте',
				{
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: 'Участвовать',
									url: `https://t.me/${config
										.get('CHANNEL')
										.slice(1)}/${event.messageId}`,
								},
							],
						],
					},
				},
			);
		} catch (e) {
			console.log(e);
		}
	});
	const keys = ['Q1', 'Q6'];
	Object.entries(MenuButtons)
		.filter((e) => keys.includes(e[0]))
		.map((e) => e[1])
		.forEach((e) => {
			composer.hears(e, async (ctx) => {
				try {
					ctx.session.event = e;
					await ctx.conversation.enter('order_a_call');
				} catch (e) {}
			});
		});

	composer.command('create_event', async (ctx) => {
		try {
			await ctx.conversation.enter('create_event');
		} catch (e) {
			console.log(e);
		}
	});

	composer.hears(MenuButtons.Q7, async (ctx) => {
		try {
			await ctx.conversation.enter('send_contacts');
		} catch (e) {}
	});

	composer.hears(MenuAdminButtons.Q1, async (ctx) => {
		if (ctx.session.role.type !== RolesEnum.ADMIN) return;
		try {
			await ctx.conversation.enter('get_winner');
		} catch (e) {}
	});
	composer.hears(MenuAdminButtons.Q2, async (ctx) => {
		if (ctx.session.role.type !== RolesEnum.ADMIN) return;
		try {
			await ctx.conversation.enter('codes_check');
		} catch (e) {}
	});
	composer.hears(MenuButtons.Q9, async (ctx) => {
		try {
			await ctx.conversation.enter('codes_input');
		} catch (e) {}
	});
	//
	// composer.hears(MenuButtons.Q6, async (ctx) => {
	//   try {
	//     await ctx.conversation.enter('promo');
	//   } catch (e) {}
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
