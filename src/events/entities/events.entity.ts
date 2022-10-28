import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersCenterEntity } from '../../users-center/entities/users.entity';

@Entity('events')
export class EventsEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToMany(() => UsersCenterEntity, (cuser) => cuser.event)
  users: UsersCenterEntity[];

  @Column({ type: 'boolean', default: true })
  relative: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  readonly createdAt: Date;

  @Column()
  name: string;

  @Column()
  messageId: number;

  @Column({ type: 'timestamptz' })
  dateToRelease: Date;
}
