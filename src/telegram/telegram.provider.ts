import { Provider } from '@nestjs/common';
import { TelegramTokensEnum } from './enum/tokens/telegram.tokens.enum';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './update/telegram.update';
import { MenuWizard } from './wizards/menu.wizard';
import { MakeAdminWizard } from './wizards/make-admin.wizard';
import { AdminMenuWizard } from './wizards/admin-menu.wizard';
import { MakeSellerWizard } from './wizards/make-seller.wizard';
import { SellersWizard } from './wizards/sellers.wizard';
import { SellerMenuWizard } from './wizards/seller-menu.wizard';

export const TelegramProvider: Provider[] = [
  {
    provide: TelegramTokensEnum.TELEGRAM_SERVICE_TOKEN,
    useClass: TelegramService,
  },
  {
    provide: TelegramTokensEnum.TELEGRAM_UPDATE_TOKEN,
    useClass: TelegramUpdate,
  },
  {
    provide: TelegramTokensEnum.TELEGRAM_MENU_WIZARD_TOKEN,
    useClass: MenuWizard,
  },
  {
    provide: TelegramTokensEnum.TELEGRAM_MAKE_ADMIN_WIZARD_TOKEN,
    useClass: MakeAdminWizard,
  },

  {
    provide: TelegramTokensEnum.TELEGRAM_MAKE_SELLER_WIZARD_TOKEN,
    useClass: MakeSellerWizard,
  },
  {
    provide: TelegramTokensEnum.TELEGRAM_SELLERS_WIZARD_TOKEN,
    useClass: SellersWizard,
  },
  {
    provide: TelegramTokensEnum.TELEGRAM_ADMIN_MENU_WIZARD_TOKEN,
    useClass: AdminMenuWizard,
  },

  {
    provide: TelegramTokensEnum.TELEGRAM_SELLER_MENU_WIZARD_TOKEN,
    useClass: SellerMenuWizard,
  },
];
