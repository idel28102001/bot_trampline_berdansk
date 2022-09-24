import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsersRole } from '../enum/users.role';
import { CouponUserEntity } from '../../coupons/entities/coupon-user.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false, unique: true })
  telegramId: string;

  @Column({ default: 'ИМЯ' })
  name: string;

  @OneToMany(() => CouponUserEntity, (coupon) => coupon.user)
  coupons: CouponUserEntity[];

  @Column({ default: false })
  wantToBeSeller: boolean;

  @Column({ type: 'enum', enum: UsersRole, default: UsersRole.USER })
  role: UsersRole;
}
