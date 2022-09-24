import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import * as dotenv from 'dotenv';
import { Inject } from '@nestjs/common';
import { UsersTokensEnum } from '../../users/enum/users.tokens.enum';
import { UsersService } from '../../users/users.service';

dotenv.config();

@Wizard('make-admin')
export class MakeAdminWizard {
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
    await ctx.reply('Введите секретный код, чтобы стать админом');
    await ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text as string;
    if (!message) {
      await ctx.scene.leave();
      return;
    }
    if (message === process.env.SECRET_CODE) {
      await this.usersService.makeAdmin(ctx.from.id);
      await ctx.reply('Теперь вы обладаёте правами администратора');
      await ctx.scene.leave();
    } else {
      await ctx.reply('Пароль введён неверно');
      await ctx.scene.leave();
    }
  }
}
