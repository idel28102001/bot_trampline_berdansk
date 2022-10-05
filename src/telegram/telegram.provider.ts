import { Provider } from '@nestjs/common';
import { TelegramTokensEnum } from './enum/tokens/telegram.tokens.enum';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './update/telegram.update';
import { OrderCallWizard } from './wizards/orderCall.wizard';
import { MakeAdminWizard } from './wizards/make-admin.wizard';
import { AdminMenuWizard } from './wizards/admin-menu.wizard';
import { MakeSellerWizard } from './wizards/make-seller.wizard';
import { SellersWizard } from './wizards/sellers.wizard';
import { SellerMenuWizard } from './wizards/seller-menu.wizard';
import { TelegramWizardsTokensEnum } from './enum/tokens/telegram.wizards.tokens.enum';
import { BookEventWizard } from './wizards/bookEvent.wizard';

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
    provide: TelegramWizardsTokensEnum.TELEGRAM_ORDER_CALL_WIZARD_TOKEN,
    useClass: OrderCallWizard,
  },
  {
    provide: TelegramWizardsTokensEnum.TELEGRAM_MAKE_ADMIN_WIZARD_TOKEN,
    useClass: MakeAdminWizard,
  },

  {
    provide: TelegramWizardsTokensEnum.TELEGRAM_MAKE_SELLER_WIZARD_TOKEN,
    useClass: MakeSellerWizard,
  },
  {
    provide: TelegramWizardsTokensEnum.TELEGRAM_SELLERS_WIZARD_TOKEN,
    useClass: SellersWizard,
  },
  {
    provide: TelegramWizardsTokensEnum.TELEGRAM_ADMIN_MENU_WIZARD_TOKEN,
    useClass: AdminMenuWizard,
  },

  {
    provide: TelegramWizardsTokensEnum.TELEGRAM_SELLER_MENU_WIZARD_TOKEN,
    useClass: SellerMenuWizard,
  },
  {
    provide: TelegramWizardsTokensEnum.TELEGRAM_BOOK_EVENT_WIZARD_TOKEN,
    useClass: BookEventWizard,
  },
];
