import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import * as dotenv from 'dotenv';
import { TelegramService } from '../telegram.service';
import { Inject } from '@nestjs/common';
import { TelegramTokensEnum } from '../enum/tokens/telegram.tokens.enum';
import { UsersService } from '../../users/users.service';
import { UsersTokensEnum } from '../../users/enum/users.tokens.enum';
import { CouponsTokenEnum } from '../../coupons/enum/tokens/coupons.token.enum';
import { CouponsService } from '../../coupons/coupons.service';
import { SELLERMENULIST } from '../../common/constants';
import { StatusEnum } from '../../coupons/enum/status.enum';

dotenv.config();

@Wizard('seller-menu')
export class SellerMenuWizard {
  constructor(
    @Inject(TelegramTokensEnum.TELEGRAM_SERVICE_TOKEN)
    private readonly telegramService: TelegramService,
    @Inject(UsersTokensEnum.USERS_SERVICE_TOKEN)
    private readonly usersService: UsersService,
    @Inject(CouponsTokenEnum.COUPONS_SERVICE_TOKEN)
    private readonly couponsService: CouponsService,
  ) {}

  async deleteMessage(ctx) {
    try {
      await ctx.deleteMessage();
      await ctx.deleteMessage();
    } catch (e) {}
  }

  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    const isAdmin = await this.usersService.checkSellerRights(ctx.from.id);
    if (!isAdmin) {
      await ctx.reply('Вы не обладаете правами кассира');
      await ctx.scene.leave();
      return;
    }
    await ctx.reply(
      `Выберите, что вам требуется:\n\n${SELLERMENULIST.join('\n')}`,
      {
        reply_markup: {
          keyboard: SELLERMENULIST.map((e) => [{ text: e }]),
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      },
    );
    await ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text;
    if (!message) {
      await ctx.scene.leave();
      return;
    }
    const firstNum = Number(String(message).trim()[0]);
    if (
      isNaN(firstNum) ||
      firstNum > SELLERMENULIST.length + 1 ||
      firstNum < 1
    ) {
      await ctx.reply('Пожалуйста - выберите из списка возможных вариантов');
      await ctx.wizard.selectStep(1);
      return;
    }
    switch (firstNum) {
      case 1: {
        await ctx.reply('Введите промокод:');
        await ctx.wizard.next();
        return;
      }
    }
    await ctx.scene.leave();
  }

  @WizardStep(3)
  async step3(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text?.trim();
    if (!message) {
      await ctx.scene.leave();
      return;
    }
    const coup = await this.couponsService.getCouponByItsValue(message);
    if (coup) {
      if (coup.status === StatusEnum.NEW) {
        await ctx.reply(
          `Купон найден и ещё не был использован\n\n"${coup.coupon.name}"\nИспользовать?`,
          {
            reply_markup: {
              keyboard: [[{ text: 'Да' }, { text: 'Нет' }]],
              one_time_keyboard: true,
              resize_keyboard: true,
            },
          },
        );
        (ctx as any).session.coupon = coup;
        await ctx.wizard.next();
        return;
      }
      {
        await ctx.reply('Купон уже был использован');
        await ctx.scene.leave();
        return;
      }
    } else {
      await ctx.reply('Купон не найден');
      await ctx.scene.leave();
    }
  }

  @WizardStep(4)
  async step4(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text?.trim()?.toLowerCase();
    if (!message) {
      await ctx.scene.leave();
      return;
    }
    switch (message) {
      case 'да': {
        await this.couponsService.activareCouponById(
          (ctx as any).session.coupon.id,
        );
        await ctx.reply(
          `Купон был успешно активирован!\n\n"${
            (ctx as any).session.coupon.coupon.name
          }"`,
        );
        break;
      }
      case 'нет': {
        break;
      }
      default: {
        await ctx.reply('Ответ - да или нет');
        await ctx.wizard.selectStep(3);
        return;
      }
    }
    await ctx.scene.leave();
  }
}
