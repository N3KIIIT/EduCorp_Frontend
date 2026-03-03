import React from 'react';
import { Group, Header, Placeholder } from '@vkontakte/vkui';
import { UserCardModel } from '../../model/domain/UserCardModel';
import { UserCard } from '@/entities/user/ui';
import { useTranslations } from 'next-intl';
import './UserCardList.css';

interface UserCardListProps {
    users: UserCardModel[];
    onUserClick?: (userId: string) => void;
    className?: string;
}

export const UserCardList: React.FC<UserCardListProps> = ({
    users,
    onUserClick,
    className = ''
}) => {
    const t = useTranslations('user.card.list');

    if (!users.length) {
        return (
            <Placeholder
                className={`user-card-list-empty ${className}`}
            >
                {t('empty')}
            </Placeholder>
        );
    }

    return (
        <Group
            className={`user-card-list ${className}`}
            header={<Header >{t('found')}{users.length}</Header>}
        >
            {users.map(user => (
                <UserCard
                    key={user.id}
                    user={user}
                    onClick={() => onUserClick?.(user.id)}
                />
            ))}
        </Group>
    );
};
