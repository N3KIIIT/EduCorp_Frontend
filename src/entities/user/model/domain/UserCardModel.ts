import type { TelegramUserData } from './TelegramUserData';


export class UserCardModel {
    constructor(
        public readonly id: string,
        public readonly firstName: string,
        public readonly lastName: string | null,
        public readonly telegramData: TelegramUserData | null,
        public readonly createdAt: Date,
        public readonly isActive: boolean
    ) {}


    get fullName(): string {
        return this.lastName
            ? `${this.firstName} ${this.lastName}`
            : this.firstName;
    }


    get hasTelegramLinked(): boolean {
        return this.telegramData !== null;
    }


    get formattedCreatedAt(): string {
        return new Intl.DateTimeFormat('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(this.createdAt);
    }


    get statusText(): string {
        return this.isActive ? 'Активен' : 'Неактивен';
    }
}
