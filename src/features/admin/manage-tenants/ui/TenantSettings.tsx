'use client';

import React, {useEffect, useState} from 'react';
import {Button, FormItem, FormLayoutGroup, Group, Input, Select} from '@vkontakte/vkui';
import {useTranslations} from 'next-intl';
import {TenantGeneralResponse, TenantStatus} from '@/lib/api-client/types.gen';
import AuthGuard from "@/entities/session/lib/auth-guard";
import {ROLES} from "@/entities/session";

interface TenantSettingsProps {
    tenant: TenantGeneralResponse;
}

export const TenantSettings: React.FC<TenantSettingsProps> = ({tenant}) => {
    const t = useTranslations('admin.tenants.settings');
    const tStatus = useTranslations('admin.tenants.statusValues');
    const [name, setName] = useState(tenant.tenantName);
    const [subdomain, setSubdomain] = useState(tenant.tenantSubDomain);
    const [status, setStatus] = useState(tenant.tenantStatus);

    useEffect(() => {
        setName(tenant.tenantName);
        setSubdomain(tenant.tenantSubDomain);
        setStatus(tenant.tenantStatus);
    }, [tenant]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Update tenant', {name, subdomain, status});
    };

    return (
        <Group>
            <AuthGuard requiredRoles={[ROLES.SUPER_ADMIN]}>
                <form onSubmit={handleSubmit}>
                    <FormLayoutGroup>
                        <FormItem top={t('name')}>
                            <Input value={name} onChange={(e) => setName(e.target.value)}/>
                        </FormItem>
                        <FormItem top={t('subdomain')}>
                            <Input value={subdomain} onChange={(e) => setSubdomain(e.target.value)}/>
                        </FormItem>
                        <FormItem top={t('status')}>
                            <Select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as TenantStatus)}
                                options={[
                                    {value: 'Active', label: tStatus('Active')},
                                    {value: 'Inactive', label: tStatus('Inactive')},
                                ]}
                            />
                        </FormItem>
                        <FormItem>
                            <Button size="l" stretched type="submit">
                                {t('save')}
                            </Button>
                        </FormItem>
                    </FormLayoutGroup>
                </form>
            </AuthGuard>
        </Group>
    );
};
