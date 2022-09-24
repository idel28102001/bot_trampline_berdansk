import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import * as dotenv from 'dotenv';
import { Inject } from '@nestjs/common';
import { UsersTokensEnum } from '../../users/enum/users.tokens.enum';
import { UsersService } from '../../users/users.service';

dotenv.config();

@Wizard('make-seller')
export class MakeSellerWizard {
  constructor(
    @Inject(UsersTokensEnum.USERS_SERVICE_TOKEN)
    private readonly usersService: UsersService,
  ) {}

  async deleteMessage(ctx) {
    try {
      await ctx.deleteMessage();
      await ctx.deleteMessage();
    } catch (e) {}
  }

  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    await ctx.reply('Введите ваше имя');
    await this.usersService.repo.update(
      { telegramId: ctx.from.id.toString() },
      { wantToBeSeller: true },
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
    (ctx as any).session.name = message;
    await ctx.reply(`Вас зовут ${message}?`, {
      reply_markup: {
        one_time_keyboard: true,
        resize_keyboard: true,
        keyboard: [
          [{ text: 'Да' }, { text: 'Перезаписать' }, { text: 'Отмена' }],
        ],
      },
    });
    await ctx.wizard.next();
  }

  @WizardStep(3)
  async step3(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text;
    if (!message) {
      await ctx.scene.leave();
      return;
    }

    switch (message.toLowerCase()) {
      case 'да': {
        await ctx.reply('Вы отправили запрос на становление кассиром');
        await this.usersService.repo.update(
          {
            telegramId: ctx.from.id.toString(),
          },
          { wantToBeSeller: true, name: (ctx as any).session.name },
        );
        await ctx.scene.leave();
        break;
      }
      case 'перезаписать': {
        await ctx.reply(`Введите ваше имя`);
        await ctx.wizard.selectStep(1);
        break;
      }
      case 'отмена': {
        await ctx.scene.leave();
        break;
      }
      default: {
        await ctx.reply('Пожалуйста - выберите из списка возможных вариантов');
        await ctx.wizard.selectStep(2);
        break;
      }
    }
  }
}
