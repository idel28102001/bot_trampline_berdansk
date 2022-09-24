import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { ADMINMENULIST } from 'src/common/constants';
import { Scenes } from 'telegraf';
import * as dotenv from 'dotenv';
import { TelegramService } from '../telegram.service';
import { Inject } from '@nestjs/common';
import { TelegramTokensEnum } from '../enum/tokens/telegram.tokens.enum';
import { UsersService } from '../../users/users.service';
import { UsersTokensEnum } from '../../users/enum/users.tokens.enum';
import { CouponsTokenEnum } from '../../coupons/enum/tokens/coupons.token.enum';
import { CouponsService } from '../../coupons/coupons.service';

dotenv.config();

@Wizard('admin-menu')
export class AdminMenuWizard {
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
    const isAdmin = await this.usersService.checkAdminRights(ctx.from.id);
    if (!isAdmin) {
      await ctx.reply('Вы не обладаете правами администратора');
      await ctx.scene.leave();
      return;
    }

    const keyboard = Object.values(ADMINMENULIST).map((e) => [
      { text: String(e) },
    ]);
    if (!keyboard.length) {
      await ctx.reply(
        'Пока списка возможностей у администора нет, но не расстраивайтесь - скоро они появятся!',
      );
      await ctx.scene.leave();
      return;
    }
    const count = await this.usersService.repo
      .createQueryBuilder('U')
      .where('U.wantToBeSeller=:want', { want: true })
      .getCount();
    const newList = [...ADMINMENULIST];
    (ctx as any).session.count = count;
    newList[1] = newList[1] + (count > 0 ? `❗ (${count})` : ' (0)');
    await ctx.reply(`Выберите, что вам требуется:\n\n${newList.join('\n')}`, {
      reply_markup: {
        keyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    await ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text;
    if (!message) {
      await ctx.scene.leave();
      return;
    }
    const first = message.toString()[0];
    switch (first) {
      case '1': {
        await ctx.reply('Введите текст купона');
        await ctx.wizard.next();
        break;
      }
      case '2': {
        await ctx.scene.leave();
        if ((ctx as any).session.count === 0) {
          await ctx.reply('Заявок на кассиров нет');
        } else {
          await ctx.scene.enter('sellers');
        }
        return;
      }
    }
  }

  @WizardStep(3)
  async step3(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text;
    if (!message) {
      await ctx.scene.leave();
      return;
    }
    await ctx.reply(`Ваш текст:\n\n${message}`, {
      reply_markup: {
        keyboard: [
          [{ text: 'Да' }, { text: 'Переделать' }, { text: 'Отмена' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    (ctx as any).session.event = message;
    await ctx.wizard.next();
  }

  @WizardStep(4)
  async step4(@Context() ctx: Scenes.WizardContext) {
    const cntx = ctx as any;
    const message = (ctx as any).update?.message?.text;
    if (!message) {
      await ctx.scene.leave();
      return;
    }
    switch (message.toLowerCase()) {
      case 'да': {
        await ctx.reply('Акция создана!');
        await this.couponsService.createCoupon(cntx.session.event);
        await ctx.scene.leave();
        break;
      }
      case 'переделать': {
        await ctx.reply('Введите текст купона');
        await ctx.wizard.selectStep(2);
        break;
      }
      case 'отмена': {
        await ctx.scene.leave();
        break;
      }
      default: {
        await ctx.reply('Пожалуйста - выберите из списка возможных вариантов');
        await ctx.wizard.selectStep(3);
        break;
      }
    }
  }
}
