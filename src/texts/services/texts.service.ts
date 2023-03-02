import { Injectable } from '@nestjs/common';
import { User } from '@grammyjs/types';
import { CANCEL, DIALOGS } from '../../common/texts';
import {
	choose,
	formatPhone,
	generateWhatsappLink,
	MyContext,
	MyConversation,
} from '../../common/utils';
import {
	addDays,
	addMonths,
	eachDayOfInterval,
	format,
	getDay,
	isSameMonth,
	lastDayOfMonth,
	set,
	setDate,
	subMonths,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { chunk } from '../../common/constants';

@Injectable()
export class TextsService {
	async getTimes(conversation: MyConversation, ctx: MyContext) {
		const dayDate = await this.getDate(conversation, ctx);
		let i = 0;
		const ages = new Array(18).fill(1).map((e) => `${i++}`);
		await ctx
			.reply(DIALOGS.MEETINGS.DATE.A3, {
				reply_markup: {
					keyboard: [
						...chunk(
							ages.map((e) => ({ text: e })),
							6,
						),
						[{ text: CANCEL }],
					],
					resize_keyboard: true,
					one_time_keyboard: true,
				},
			})
			.catch((e) => undefined);
		const age = await conversation.form.select(ages, async (ctx) => {
			await ctx.reply(DIALOGS.MEETINGS.DATE.A7).catch((e) => undefined);
		});
		const counts = DIALOGS.MEETINGS.DATE.A5;
		await ctx
			.reply(DIALOGS.MEETINGS.DATE.A4, {
				reply_markup: {
					keyboard: [...chunk(counts, 6), [{ text: CANCEL }]],
					resize_keyboard: true,
					one_time_keyboard: true,
				},
			})
			.catch((e) => undefined);
		const count = await conversation.form.select(counts, choose);
		return DIALOGS.MEETINGS.DATE.A6(dayDate, age, count);
	}

	async getSpecificDates(
		conversation: MyConversation,
		ctx: MyContext,
		only = [],
	) {
		const currDate = new Date();
		const days = eachDayOfInterval({
			start: currDate,
			end: addDays(currDate, 7 * 7),
		})
			.filter((e) => {
				if (!only.length) return true;
				return only.includes(getDay(e));
			})
			.map((e) => ({
				text: format(e, 'd MMMM (cccc)', { locale: ru }),
				date: e,
			}))
			.slice(0, 14);
		await ctx
			.reply(DIALOGS.MEETINGS.DATE.A8, {
				reply_markup: {
					keyboard: [
						...chunk(
							days.map((e) => ({ text: e.text })),
							4,
						),
						[{ text: CANCEL }],
					],
					resize_keyboard: true,
					one_time_keyboard: true,
				},
			})
			.catch((e) => undefined);
		const day = await conversation.form.select(days.map((e) => e.text));
		return DIALOGS.MEETINGS.DATE.A9(day);
	}

	async getDate(conversation: MyConversation, ctx: MyContext) {
		let currDate = subMonths(new Date(), 1);
		const months = new Array(4).fill(1).map((e) => {
			currDate = addMonths(currDate, 1);
			const word = format(currDate, 'LLLL', { locale: ru });
			const date = new Date(currDate);
			return { text: word, date };
		});
		await ctx
			.reply(DIALOGS.MEETINGS.DATE.A1, {
				reply_markup: {
					keyboard: [
						...chunk(
							months.map((e) => ({ text: e.text })),
							2,
						),
						[{ text: CANCEL }],
					],
					resize_keyboard: true,
					one_time_keyboard: true,
				},
			})
			.catch((e) => undefined);
		const month = await conversation.form.select(
			months.map((e) => e.text),
			choose,
		);
		const monthDate = months.find((e) => e.text === month).date;
		const startDate = isSameMonth(new Date(), monthDate)
			? addDays(new Date(), 1)
			: setDate(monthDate, 1);
		const currDays = eachDayOfInterval({
			start: startDate,
			end: lastDayOfMonth(monthDate),
		}).map((e) => ({ text: format(e, 'd', { locale: ru }), day: e }));
		await ctx
			.reply(DIALOGS.MEETINGS.DATE.A2, {
				reply_markup: {
					keyboard: [
						...chunk(
							currDays.map((e) => ({ text: e.text })),
							8,
						),
						[{ text: CANCEL }],
					],
					resize_keyboard: true,
					one_time_keyboard: true,
				},
			})
			.catch((e) => undefined);
		const day = await conversation.form.select(
			currDays.map((e) => e.text),
			choose,
		);
		const dayDate = currDays.find((e) => e.text === day).day;
		return set(dayDate, {
			minutes: 0,
			milliseconds: 0,
			seconds: 0,
			hours: 0,
		});
	}

	prepareToChat(
		{
			from,
			comment,
			phoneNumber,
			event,
		}: {
			from: User;
			phoneNumber: string;
			comment: string;
			event: string;
		},
		birthDay = undefined,
	) {
		phoneNumber = formatPhone(phoneNumber);
		const toG = DIALOGS.MEETINGS.CREATE.ALL.TO_GOOGLE;
		const nickname = from.username
			? `${toG.P1}: @${from.username}`
			: `${toG.P1}: <a href="tg://user?id=${from.id}">Написать</a>`;
		let name = `${from.first_name ? from.first_name + ' ' : ''}${
			from.last_name ? from.last_name : ''
		}`.trim();
		name = name ? `${toG.P2}: ${name}\n` : '';
		const whatsapp = `${toG.P10}: <a href="${generateWhatsappLink(
			phoneNumber,
			event,
		)}">${toG.P3}</a>`;
		return `${toG.P5}: ${event}\n${name}${birthDay ? birthDay + '\n' : ''}${
			toG.P6
		}: ${comment || toG.P7}\n${
			toG.P8
		}: ${phoneNumber}\n${nickname}\n${whatsapp}`;
	}
}
