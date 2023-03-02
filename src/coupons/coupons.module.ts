import { Module } from '@nestjs/common';
import { CouponsProvider } from './coupons.provider';
import { DatabaseModule } from '../database/database.module';
import { CouponsTokenEnum } from './enum/tokens/coupons.token.enum';
import { UsersCenterModule } from '../users-center/users-center.module';

@Module({
    imports: [DatabaseModule, UsersCenterModule],
    providers: CouponsProvider,
    exports: [CouponsTokenEnum.COUPONS_SERVICE_TOKEN],
})
export class CouponsModule {}
