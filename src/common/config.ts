import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export class Config {
    private config: ConfigService;

    constructor() {
        this.config = new ConfigService();
    }

    get isDevelopment() {
        return this.get<string>('NODE_ENV') === 'development';
    }

    get getForGoogle() {
        return {
            SCOPES: this.getScopes,
            TOKEN_PATH: this.getToken,
            CREDENTIALS_PATH: this.getCredentials,
        };
    }

    get getCredentials() {
        return JSON.parse(process.env.CREDENTIALS);
    }

    get getSecret() {
        return process.env.SECRET_CODE;
    }

    get calendarId() {
        return process.env.CALENDAR_ID;
    }

    get getToken() {
        return path.join(process.cwd(), 'token.json');
    }

    get getScopes() {
        return 'https://www.googleapis.com/auth/calendar';
    }

    public get getBook() {
        return this.config.get('CHATBOOK');
    }

    public get<T = any>(propertyPath: string, defaultValue?: T) {
        return this.config.get(propertyPath, defaultValue);
    }

    public getDatabaseOptions(): DataSourceOptions {
        return {
            type: 'postgres',
            host: this.get('POSTGRES_HOST'),
            port: Number(this.get('POSTGRES_PORT')),
            username: this.get('POSTGRES_USER'),
            password: this.get('POSTGRES_PASSWORD'),
            database: this.get('POSTGRES_DB'),
            entities: [__dirname + '/../**/**/*.entity{.ts,.js}'],
            migrations: [__dirname + '/../**/**/*-migration{.ts,.js}'],
            synchronize: false,
        };
    }
}

export const config = new Config();
