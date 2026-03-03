import type { UserResponse, UserPagedResponse } from '@/lib/api-client/types.gen';
import { User } from '../../model/domain/User';
import { UserCardModel } from '../../model/domain/UserCardModel';
import { roleMapper } from './role.mapper';
import { telegramUserDataMapper } from './telegram-user-data.mapper';
import { permissionMapper } from './permission.mapper';

class UserMapper {

    toDomain(dto: UserResponse): User {
        return new User(
            dto.id,
            dto.firstName,
            dto.lastName ?? null,
            dto.phoneNumber ?? null,
            dto.telegramData
                ? telegramUserDataMapper.toDomain(dto.telegramData)
                : null,
            new Date(dto.createdAt),
            dto.lastLogin ? new Date(dto.lastLogin) : null,
            dto.isActive,
            dto.roles.map(roleBrief => roleMapper.toDomainFromBrief(roleBrief)),
            dto.permissions ? permissionMapper.toDomainList(dto.permissions) : []
        );
    }

    toDomainList(dtos: UserResponse[]): User[] {
        return dtos.map(dto => this.toDomain(dto));
    }

    toPagedDomainList(dtos: UserPagedResponse[]): UserCardModel[] {
        return dtos.map(dto => this.toCardModel(dto));
    }

    toCardModel(dto: UserPagedResponse): UserCardModel {
        return new UserCardModel(
            dto.id,
            dto.firstName,
            dto.lastName ?? null,
            dto.telegramData
                ? telegramUserDataMapper.toDomain(dto.telegramData)
                : null,
            new Date(dto.createdAt),
            dto.isActive
        );
    }


    toCardModelList(dtos: UserPagedResponse[]): UserCardModel[] {
        return dtos.map(dto => this.toCardModel(dto));
    }

    toDto(domain: User): Partial<UserResponse> {
        return {
            id: domain.id,
            firstName: domain.firstName,
            lastName: domain.lastName ?? undefined,
            phoneNumber: domain.phoneNumber ?? undefined,
            isActive: domain.isActive,
        };
    }
}

export const userMapper = new UserMapper();
