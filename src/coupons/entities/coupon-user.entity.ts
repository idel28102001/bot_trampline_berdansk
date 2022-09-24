import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/users.entity';
import { StatusEnum } from '../enum/status.enum';
import { CouponsEntity } from './coupons.entity';

@Entity('coupons-user')
export class CouponUserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.coupons)
  user: UserEntity;

  @ManyToOne(() => CouponsEntity, (coupon) => coupon.cusers)
  coupon: CouponsEntity;

  @CreateDateColumn({ type: 'timestamp' })
  readonly createdAt: Date;

  @Column()
  value: string;

  @Column({ type: 'enum', enum: StatusEnum, default: StatusEnum.NEW })
  status: StatusEnum;
}
