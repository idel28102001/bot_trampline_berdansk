import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	ManyToMany,
	JoinTable,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { RolesEnum } from '../enums/roles.enum';
import { CouponUserEntity } from '../../coupons/entities/coupon-user.entity';
import { EventsEntity } from '../../events/entities/events.entity';
import { CodesEntity } from '../../codes/entities/codes.entity';

@Entity('users')
export class UsersCenterEntity {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@CreateDateColumn({ nullable: true })
	createdAt: number;

	@Column({ nullable: false, unique: true })
	telegramId: string;

	@Column({ nullable: true })
	phoneNumber: string;

	@Column({ nullable: true })
	username: string;

	@Column({ nullable: true })
	firstname: string;

	@Column({ nullable: true })
	lastname: string;

	@Column({ default: RolesEnum.USER, type: 'enum', enum: RolesEnum })
	role: RolesEnum;

	@OneToMany(() => CouponUserEntity, (coupon) => coupon.user)
	coupons: CouponUserEntity[];

	@ManyToMany(() => CodesEntity, (code) => code.users)
	@JoinTable()
	codes: CodesEntity[];

	@ManyToOne(() => EventsEntity, (event) => event.users)
	event: EventsEntity;

	@Column({ default: false })
	wantToBeSeller: boolean;
}
