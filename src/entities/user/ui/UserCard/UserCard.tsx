import React from 'react';
import { Cell, Avatar } from '@vkontakte/vkui';
import { UserCardModel } from '../../model/domain/UserCardModel';
import { useTranslations } from 'next-intl';
import './UserCard.css';

interface UserCardProps {
    user: UserCardModel;
    onClick?: () => void;
    className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({
    user,
    onClick,
    className = ''
}) => {
    const t = useTranslations('user.card');
    const statusBadge = user.isActive
        ? { color: 'var(--vkui--color_background_positive)', text: t('status.active') }
        : { color: 'var(--vkui--color_background_negative)', text: t('status.inactive') };

    const before = (
        <Avatar
            size={48}
            src={user.hasTelegramLinked && user.telegramData?.photoUrl ? user.telegramData.photoUrl : undefined}
            initials={!user.hasTelegramLinked ? user.firstName.charAt(0).toUpperCase() : undefined}
        />
    );

    const subtitle = (
        <div>
            <div>{t('status.label')}<span style={{ color: statusBadge.color }}>{statusBadge.text}</span></div>
            <div>{t('created.label')}{user.formattedCreatedAt}</div>
            {user.hasTelegramLinked && (
                <div>Telegram: @{user.telegramData?.username}</div>
            )}
        </div>
    );

    return (
        <Cell
            className={`user-card ${className}`}
            before={before}
            subtitle={subtitle}
            onClick={onClick}
        >
            {user.fullName}
        </Cell>
    );
};
