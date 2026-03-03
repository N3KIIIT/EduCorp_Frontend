
export class TelegramUserData {
    constructor(
        public readonly telegramUserId: number,
        public readonly username: string | null,
        public readonly firstName: string,
        public readonly lastName: string | null,
        public readonly languageCode: string | null,
        public readonly isPremium: boolean,
        public readonly photoUrl: string | null
    ) {}


    get fullName(): string {
        return this.lastName
            ? `${this.firstName} ${this.lastName}`
            : this.firstName;
    }


    get usernameWithAt(): string | null {
        return this.username ? `@${this.username}` : null;
    }


    get profileUrl(): string {
        return this.username
            ? `https://t.me/${this.username}`
            : `tg://user?id=${this.telegramUserId}`;
    }
}
