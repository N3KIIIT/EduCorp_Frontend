import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import { useSessionStore } from '@/entities/session/model/store';
import { userMapper } from '@/entities/user/lib/mappers';
import type { UpdateUserRequest, UserResponse } from '@/lib/api-client/types.gen';
import { ValidationError, ServerError, AuthorizationError } from '@/shared/lib/errors/AppError';

interface UpdateUserData {
    firstName: string;
    lastName?: string;
    phoneNumber?: string;
}

import { useTranslations } from 'next-intl';

export const useUpdateUser = () => {
    const { user, setUser } = useSessionStore();
    const t = useTranslations('user.edit');

    return useMutation({
        mutationFn: async (data: UpdateUserData) => {
            if (!user) throw new Error(t('errors.authRequired'));

            const errors: string[] = [];
            if (!data.firstName?.trim()) errors.push(t('validate.required'));
            if (data.firstName && data.firstName.length < 2) errors.push(t('validate.minLength'));
            if (data.firstName && data.firstName.length > 50) errors.push(t('validate.maxLength'));
            if (data.lastName && data.lastName.length > 50) errors.push(t('validate.surnameMaxLength'));

            if (errors.length > 0) {
                throw new ValidationError(t('validate.check'), { errors });
            }

            const requestDto: UpdateUserRequest = {
                firstName: data.firstName,
                lastName: data.lastName ?? null,
            };

            const response = await apiClient.put({
                url: `/Users/${user.id}`,
                body: requestDto
            });

            if (response.error) {
                const status = response.response.status;
                if (status === 401) throw new AuthorizationError(t('errors.authRequired'));
                if (status === 403) throw new AuthorizationError(t('errors.accessDenied'));
                if (status >= 500) throw new ServerError(t('errors.serverUnavailable'));
                throw new ServerError(t('errors.updateFailed'));
            }


            const userDto = response.data as unknown as UserResponse;
            if (!userDto) throw new ServerError(t('errors.emptyResponse'));

            return userMapper.toDomain(userDto);
        },
        onSuccess: (updatedUser) => {
            setUser(updatedUser);
        }
    });
};
