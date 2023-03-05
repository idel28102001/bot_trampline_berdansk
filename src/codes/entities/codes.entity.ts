import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersCenterEntity } from '../../users-center/entities/users.entity';
import { CodesStatusEnum } from '../enums/codes.status.enum';

@Entity('codes')
export class CodesEntity {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@CreateDateColumn({ type: 'timestamp' })
	readonly createdAt: Date;

	@Column({
		type: 'enum',
		enum: CodesStatusEnum,
		default: CodesStatusEnum.UNUSED,
	})
	status: CodesStatusEnum;

	@Column({ name: 'date_expiration', type: Date })
	date_expiration: Date;

	@Column({ name: 'max_count_use', type: Number })
	max_count_use: number;

	@Column({ type: String, unique: true })
	code: string;

	@Column({ type: String })
	title: string;

	@Column({ type: String, nullable: true })
	description?: string;

	@ManyToMany(() => UsersCenterEntity, (user) => user.codes)
	users: UsersCenterEntity[];
}
