'use client';

import React, {useState} from 'react';
import {
    Button,
    Select,
    FormItem,
    FormLayoutGroup,
    Input,
    ModalPage,
    ModalPageHeader,
} from '@vkontakte/vkui';
import {useTranslations} from 'next-intl';
import {useGenerateInviteLink} from '../api/invite-api';

interface CreateInviteModalProps {
    tenantId: string;
    onClose: () => void;
}

const CreateInviteModal: React.FC<CreateInviteModalProps> = ({tenantId, onClose}) => {
    const t = useTranslations('admin.tenants.inviteLinks');
    const [expiresIn, setExpiresIn] = useState('01:00:00');
    const [maxUses, setMaxUses] = useState('');
    const generateLink = useGenerateInviteLink(tenantId);

    const expiresOptions = [
        {value: '01:00:00', label: t('expires1h')},
        {value: '12:00:00', label: t('expires12h')},
        {value: '72:00:00', label: t('expires3d')},
        {value: '168:00:00', label: t('expires7d')},
    ];

    const handleCreate = () => {
        generateLink.mutate(
            {
                expiresIn,
                maxUses: maxUses ? Number(maxUses) : undefined,
            },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <ModalPage
            id="create-invite"
            onClose={onClose}
            header={<ModalPageHeader>{t('createTitle')}</ModalPageHeader>}
            open
        >
            <FormLayoutGroup>
                <FormItem top={t('expiresIn')}>
                    <Select
                        value={expiresIn}
                        onChange={(e) => setExpiresIn(e.target.value)}
                        options={expiresOptions}
                    />
                </FormItem>
                <FormItem top={t('maxUses')}>
                    <Input
                        type="number"
                        value={maxUses}
                        onChange={(e) => setMaxUses(e.target.value)}
                        placeholder={t('maxUsesPlaceholder')}
                    />
                </FormItem>
                <FormItem>
                    <Button
                        size="l"
                        stretched
                        loading={generateLink.isPending}
                        onClick={handleCreate}
                    >
                        {t('generate')}
                    </Button>
                </FormItem>
            </FormLayoutGroup>
        </ModalPage>
    );
};

export default CreateInviteModal;
