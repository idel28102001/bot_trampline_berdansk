import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import * as dotenv from 'dotenv';
import { Inject } from '@nestjs/common';
import { UsersTokensEnum } from '../../users/enum/users.tokens.enum';
import { UsersService } from '../../users/users.service';
import { UsersRole } from '../../users/enum/users.role';

dotenv.config();

@Wizard('sellers')
export class SellersWizard {
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
    const sellers = await this.usersService.repo.find({
      where: { wantToBeSeller: true },
    });
    let i = 1;
    (ctx as any).session.list = sellers;
    const list = sellers.map((e) => `${i++} ${e.name}`);
    await ctx.reply(`Вот ваш список:\n${list.join('\n')}`, {
      reply_markup: {
        keyboard: [
          ...list.map((e) => [{ text: e }]),
          ...[[{ text: 'Отмена' }]],
        ],
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
    if (message.toLowerCase() === 'отмена') {
      await ctx.scene.leave();
      return;
    }
    const first = Number(message.toLowerCase().split(' ')[0]);
    if (isNaN(first)) {
      await ctx.reply('Введите из списка');
      await ctx.wizard.selectStep(1);
      return;
    }
    if ((ctx as any).session.list.length < first) {
      await ctx.reply('Введите из списка');
      await ctx.wizard.selectStep(1);
      return;
    }
    await ctx.reply(
      `Выберите, что вы хотите сделать:\n1 Принять\n2 Отклонить`,
      {
        reply_markup: {
          keyboard: [[{ text: '1 Принять' }, { text: '2 Отклонить' }]],
          one_time_keyboard: true,
          resize_keyboard: true,
        },
      },
    );
    (ctx as any).session.seller = (ctx as any).session.list[first - 1];
    await ctx.wizard.next();
  }

  @WizardStep(3)
  async step3(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text;
    if (!message) {
      await ctx.scene.leave();
      return;
    }
    const seller = (ctx as any).session.seller;
    const first = Number(message.toString()[0]);
    if (isNaN(first) || ![1, 2].includes(first)) {
      await ctx.reply('Выберите из списка ответов');
      await ctx.wizard.selectStep(2);
      return;
    }
    switch (first) {
      case 1: {
        await this.usersService.repo.update(
          { telegramId: seller.telegramId },
          {
            wantToBeSeller: false,
            role: UsersRole.SELLER,
          },
        );
        await ctx.reply(
          `Хорошо, участник с именем "${seller.name}" был добавлен как кассир`,
        );
        await ctx.scene.leave();
        return;
      }
      case 2: {
        await this.usersService.repo.update(
          { telegramId: seller.telegramId },
          { wantToBeSeller: false },
        );
        await ctx.reply(
          `Хорошо, участник с именем "${seller.name}" был отклонён`,
        );
        await ctx.scene.leave();
      }
    }
  }
}
