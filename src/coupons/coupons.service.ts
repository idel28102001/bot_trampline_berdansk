import { Inject, Injectable } from '@nestjs/common';
import { CouponsTokenEnum } from './enum/tokens/coupons.token.enum';
import { Repository } from 'typeorm';
import { CouponsEntity } from './entities/coupons.entity';
import { Context } from 'telegraf';
import { CouponUserEntity } from './entities/coupon-user.entity';
import { StatusEnum } from './enum/status.enum';
import { KEYBOARD_MENU } from '../common/constants';
import { UsersCenterTokenEnum } from '../users-center/enums/tokens/users-center.token.enum';
import { UsersCenterService } from '../users-center/services/users-center.service';

@Injectable()
export class CouponsService {
	constructor(
		@Inject(CouponsTokenEnum.COUPONS_REPOSITORY_TOKEN)
		private readonly couponsRepo: Repository<CouponsEntity>,
		@Inject(CouponsTokenEnum.COUPONS_USER_REPOSITORY_TOKEN)
		private readonly couponUserRepo: Repository<CouponUserEntity>,
		@Inject(UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN)
		private readonly usersService: UsersCenterService,
	) {}

	async activareCouponById(id: number) {
		await this.couponUserRepo.update({ id }, { status: StatusEnum.USED });
	}

	async getCouponByItsValue(value: string) {
		try {
			return await this.couponUserRepo
				.createQueryBuilder('C')
				.leftJoin('C.coupon', 'coupon')
				.where('C.value=:value', { value })
				.addSelect(['coupon.id', 'coupon.name'])
				.getOneOrFail();
		} catch (e) {}
	}

	async getTodayCoupon() {
		const coupon = await this.couponsRepo
			.createQueryBuilder('C')
			.where('C.relative=:rel', { rel: true })
			.select(['C.id', 'C.name'])
			.orderBy('id', 'DESC')
			.getOne();
		return coupon?.name || 'супер предложение';
	}

	async createCoupon(message: string) {
		const coupon = await this.couponsRepo.create({ name: message });
		await this.couponsRepo.save(coupon);
	}

	async giveCoupon(ctx: Context) {
		const from = String(ctx.from.id);
		const HopCoupon = await this.couponsRepo
			.createQueryBuilder('C')
			.where('C.relative=:rel', { rel: true })
			.orderBy('C.id', 'DESC')
			.select(['C.name', 'C.id'])
			.getOne();
		if (!HopCoupon) {
			await ctx
				.reply('Промокодов пока нет, но не беда!')
				.catch((e) => undefined);
			return;
		}
		const coupon = await this.couponUserRepo
			.createQueryBuilder('C')
			.leftJoin('C.user', 'user')
			.leftJoin('C.coupon', 'coupon')
			.where('user.telegramId=:from AND coupon.relative=:relative', {
				from,
				relative: true,
			})
			.select([
				'C.id',
				'user.id',
				'coupon.id',
				'coupon.name',
				'C.value',
				'C.status',
			])
			.getOne();
		if (coupon === null) {
			const user = await this.usersService.repo
				.createQueryBuilder('U')
				.leftJoin('U.coupons', 'coupons')
				.where('U.telegramId=:from', { from })
				.select(['U.id', 'coupons'])
				.getOne();
			if (!HopCoupon) {
				await ctx
					.reply(
						'Пока купонов нет, но вы подождите, скоро всё будет!',
					)
					.catch((e) => undefined);
			} else {
				const value = parseInt(
					String(100000 * Math.random()),
				).toString();
				const cuser = this.couponUserRepo.create({
					user,
					coupon: HopCoupon,
					value,
				});
				await this.couponUserRepo.save(cuser);
				await ctx
					.replyWithPhoto(
						'https://telegra.ph/file/94e4db4c303c37fbbb42b.jpg',
						{
							caption: `${HopCoupon.name}\n\nПромокод: ${value}`,
							reply_markup: {
								keyboard: KEYBOARD_MENU,
								resize_keyboard: true,
							},
						},
					)
					.catch((e) => undefined);
			}
		} else {
			await ctx
				.replyWithPhoto(
					'https://telegra.ph/file/94e4db4c303c37fbbb42b.jpg',
					{
						caption: `${HopCoupon.name}\n\nПромокод: ${coupon.value}`,
						reply_markup: {
							keyboard: KEYBOARD_MENU,
							resize_keyboard: true,
						},
					},
				)
				.catch((e) => undefined);
		}
	}
}
