import { Inject, Injectable } from '@nestjs/common';
import { UsersCenterTokenEnum } from 'src/users-center/enums/tokens/users-center.token.enum';
import { UsersCenterService } from 'src/users-center/services/users-center.service';
import { MoreThan, Repository } from 'typeorm';
import { CodesEntity } from './entities/codes.entity';
import { CodesStatusEnum } from './enums/codes.status.enum';
import { CodesTokenEnum } from './enums/tokens/codes.token.enum';
import { CodesInterface } from './interfaces/codes.interface';

@Injectable()
export class CodesService {
	constructor(
		@Inject(CodesTokenEnum.CODES_REPOSITORY_TOKEN)
		private readonly codesRepo: Repository<CodesEntity>,
		@Inject(UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN)
		private readonly usersService: UsersCenterService,
	) {}

	async checkItAndAsign(telegramId: string, codeString: string) {
		const user = await this.usersService.repo.findOne({
			where: { telegramId },
			relations: ['codes'],
		});
		const code = await this.codesRepo.findOne({
			where: {
				code: codeString,
				status: CodesStatusEnum.UNUSED,
				date_expiration: MoreThan(new Date()),
			},
			relations: { users: true },
		});
		if (!code) return false;
		const users = code.users;
		code.status = CodesStatusEnum.USED;
		users.push(user);
		await this.codesRepo.save(code);
		return code;
	}

	async changeCode(code: string, property: string, value: string) {
		const { affected } = await this.codesRepo.update(
			{ code },
			{ [property]: value },
		);
		return !!affected;
	}

	async deleteCode(codesEntity: CodesEntity) {
		const deleteOnes = await this.codesRepo.remove(codesEntity);
		return true;
	}

	async getCode(code: string) {
		return await this.codesRepo
			.createQueryBuilder('C')
			.where('"C".code=:code', { code })
			.leftJoinAndSelect('C.users', 'U')
			.getOne();
	}

	async getAllUnexpiredCodes() {
		return await this.codesRepo.find({
			where: { date_expiration: MoreThan(new Date()) },
			order: { id: 'DESC' },
			relations: { users: true },
		});
	}

	async getAllUnexpiredCodesFormatted() {
		const result = await this.getAllUnexpiredCodes();
		const form = result.map(({ code, title, users }) => {
			const user = users.at(0);
			let userText = 'Нет';
			if (user) {
				userText = [
					user.firstname,
					user.lastname,
					user.username ? `@${user.username}` : undefined,
					`(${user.telegramId})`,
				]
					.filter((e) => e)
					.join(' ');
			}
			return `${title} (${code})\n${userText}\n`;
		});
		return form;
	}

	async isExist(code: string) {
		return !!(await this.codesRepo.countBy({ code }));
	}

	async codeCreate(codeObj: CodesInterface) {
		const created = this.codesRepo.create(codeObj);
		const { identifiers } = await this.codesRepo
			.createQueryBuilder()
			.insert()
			.into(CodesEntity)
			.values(created)
			.orIgnore()
			.execute();
		return !!identifiers.filter((e) => e).length;
	}
}
