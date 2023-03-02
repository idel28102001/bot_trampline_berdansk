import { Provider } from '@nestjs/common';
import { DATABASE_SOURCE_TOKEN } from '../database/databse.constant';
import { DataSource } from 'typeorm';
import { CouponsTokenEnum } from './enum/tokens/coupons.token.enum';
import { CouponsService } from './coupons.service';
import { CouponsEntity } from './entities/coupons.entity';
import { CouponUserEntity } from './entities/coupon-user.entity';

export const CouponsProvider: Provider[] = [
	{
		provide: CouponsTokenEnum.COUPONS_SERVICE_TOKEN,
		useClass: CouponsService,
	},
	{
		provide: CouponsTokenEnum.COUPONS_REPOSITORY_TOKEN,
		inject: [DATABASE_SOURCE_TOKEN],
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(CouponsEntity),
	},
	{
		provide: CouponsTokenEnum.COUPONS_USER_REPOSITORY_TOKEN,
		inject: [DATABASE_SOURCE_TOKEN],
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(CouponUserEntity),
	},
];
