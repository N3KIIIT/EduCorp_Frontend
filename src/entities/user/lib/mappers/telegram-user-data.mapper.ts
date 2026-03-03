import type { TelegramUserDataResponse } from '@/lib/api-client/types.gen';
import { TelegramUserData } from '../../model/domain/TelegramUserData';


class TelegramUserDataMapper {
    toDomain(dto: TelegramUserDataResponse): TelegramUserData {
        return new TelegramUserData(
            Number(dto.id),
            dto.username ?? null,
            dto.firstName,
            dto.lastName ?? null,
            dto.languageCode ?? null,
            dto.isPremium ?? false,
            dto.photoUrl ?? null
        );
    }
}

export const telegramUserDataMapper = new TelegramUserDataMapper();
