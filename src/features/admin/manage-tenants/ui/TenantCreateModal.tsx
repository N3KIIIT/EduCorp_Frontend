'use client';

import React, {useState} from 'react';
import {Box, Button, FormItem, Header, Input, usePlatform} from '@vkontakte/vkui';
import {useTranslations} from 'next-intl';
import {useCreateTenant} from '../api/admin-api';

interface TenantCreateModalProps {
    onClose: () => void;
}

export const TenantCreateModal: React.FC<TenantCreateModalProps> = ({onClose}) => {
    const t = useTranslations('admin.tenants.modal');
    const platform = usePlatform();
    const [name, setName] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const createTenant = useCreateTenant();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTenant.mutateAsync({
                name,
                subdomain,
            });
            onClose();
        } catch (error) {
            console.error('Failed to create tenant:', error);
        }
    };

    return (
        <Box style={{
            padding: 16,
            border: '1px solid var(--vkui--color_separator_primary)',
            borderRadius: 8,
            marginTop: 16
        }}>
            <Header>{t('title')}</Header>
            <form onSubmit={handleSubmit}>
                <Box style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                    <FormItem top={t('name')}>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('namePlaceholder')}
                            required
                        />
                    </FormItem>
                    <FormItem top={t('subdomain')}>
                        <Input
                            value={subdomain}
                            onChange={(e) => setSubdomain(e.target.value)}
                            placeholder={t('subdomainPlaceholder')}
                            required
                        />
                    </FormItem>
                    <Box style={{display: 'flex', gap: 8, padding: '0 16px 16px'}}>
                        <Button size="l" stretched type="submit" loading={createTenant.isPending}>
                            {t('save')}
                        </Button>
                        <Button size="l" stretched mode="secondary" onClick={onClose}>
                            {t('cancel')}
                        </Button>
                    </Box>
                </Box>
            </form>
        </Box>
    );
};
