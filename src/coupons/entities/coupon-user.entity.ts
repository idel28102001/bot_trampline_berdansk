import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { StatusEnum } from '../enum/status.enum';
import { CouponsEntity } from './coupons.entity';
import { UsersCenterEntity } from '../../users-center/entities/users.entity';

@Entity('coupons-user')
export class CouponUserEntity {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => UsersCenterEntity, (user) => user.coupons)
	user: UsersCenterEntity;

	@ManyToOne(() => CouponsEntity, (coupon) => coupon.cusers)
	coupon: CouponsEntity;

	@CreateDateColumn({ type: 'timestamp' })
	readonly createdAt: Date;

	@Column()
	value: string;

	@Column({ type: 'enum', enum: StatusEnum, default: StatusEnum.NEW })
	status: StatusEnum;
}
