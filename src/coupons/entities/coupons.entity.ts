import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { CouponUserEntity } from './coupon-user.entity';

@Entity('coupons')
export class CouponsEntity {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@OneToMany(() => CouponUserEntity, (cuser) => cuser.coupon)
	cusers: CouponUserEntity[];

	@Column({ type: 'boolean', default: true })
	relative: boolean;

	@CreateDateColumn({ type: 'timestamp' })
	readonly createdAt: Date;
	@Column()
	name: string;
}
