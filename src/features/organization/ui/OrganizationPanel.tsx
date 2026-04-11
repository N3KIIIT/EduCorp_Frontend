'use client';

import React, { useState, useEffect } from 'react';
import {
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Group,
    FormItem,
    Input,
    Textarea,
    Button,
    Div,
    Spinner,
    SimpleCell,
    Avatar,
} from '@vkontakte/vkui';
import {
    Icon24Globe,
    Icon24Place,
    Icon24Phone,
    Icon24MailOutline,
    Icon24Write,
} from '@vkontakte/icons';
import { useTranslations } from 'next-intl';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { ROLES } from '@/entities/session';
import { useOrganizationInfo, useUpdateOrganizationInfo } from '../api/organization-api';
import type { UpdateOrganizationInfoRequest } from '../types';
import '@/features/organization/organization.css';

interface Props {
    id: string;
}

export const OrganizationPanel: React.FC<Props> = ({ id }) => {
    const t = useTranslations('organization');
    const { goBackPanel } = useNavigationStore();
    const { data: org, isLoading } = useOrganizationInfo();
    const { mutate: updateOrg, isPending } = useUpdateOrganizationInfo();

    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<UpdateOrganizationInfoRequest>({
        name: '',
        description: '',
        logoUrl: '',
        website: '',
        address: '',
        phone: '',
        email: '',
    });

    useEffect(() => {
        if (org) {
            setForm({
                name: org.name ?? '',
                description: org.description ?? '',
                logoUrl: org.logoUrl ?? '',
                website: org.website ?? '',
                address: org.address ?? '',
                phone: org.phone ?? '',
                email: org.email ?? '',
            });
        }
    }, [org]);

    const handleSave = () => {
        updateOrg(form, {
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleCancel = () => {
        if (org) {
            setForm({
                name: org.name ?? '',
                description: org.description ?? '',
                logoUrl: org.logoUrl ?? '',
                website: org.website ?? '',
                address: org.address ?? '',
                phone: org.phone ?? '',
                email: org.email ?? '',
            });
        }
        setIsEditing(false);
    };

    return (
        <Panel id={id}>
            <PanelHeader
                before={<PanelHeaderBack onClick={goBackPanel} />}
                after={
                    !isEditing && (
                        <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                            <button
                                className="orgEditHeaderBtn"
                                onClick={() => setIsEditing(true)}
                                aria-label={t('edit')}
                            >
                                <Icon24Write />
                            </button>
                        </PermissionGuard>
                    )
                }
            >
                {t('title')}
            </PanelHeader>

            {isLoading ? (
                <Div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                    <Spinner size="m" />
                </Div>
            ) : isEditing ? (
                <Group>
                    <FormItem top={t('name')} required>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            disabled={isPending}
                        />
                    </FormItem>
                    <FormItem top={t('description')}>
                        <Textarea
                            value={form.description ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            disabled={isPending}
                            rows={3}
                        />
                    </FormItem>
                    <FormItem top={t('logoUrl')}>
                        <Input
                            value={form.logoUrl ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                            disabled={isPending}
                            placeholder="https://..."
                        />
                    </FormItem>
                    <FormItem top={t('website')}>
                        <Input
                            value={form.website ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                            disabled={isPending}
                            placeholder="https://..."
                        />
                    </FormItem>
                    <FormItem top={t('address')}>
                        <Input
                            value={form.address ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                            disabled={isPending}
                        />
                    </FormItem>
                    <FormItem top={t('phone')}>
                        <Input
                            value={form.phone ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                            disabled={isPending}
                            type="tel"
                        />
                    </FormItem>
                    <FormItem top={t('email')}>
                        <Input
                            value={form.email ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            disabled={isPending}
                            type="email"
                        />
                    </FormItem>
                    <FormItem>
                        <Button
                            size="l"
                            stretched
                            loading={isPending}
                            onClick={handleSave}
                            disabled={!form.name.trim()}
                        >
                            {t('save')}
                        </Button>
                    </FormItem>
                    <FormItem>
                        <Button
                            size="l"
                            stretched
                            mode="secondary"
                            disabled={isPending}
                            onClick={handleCancel}
                        >
                            {t('cancel')}
                        </Button>
                    </FormItem>
                </Group>
            ) : (
                <>
                    {/* Logo + name hero */}
                    <div className="orgHero">
                        {org?.logoUrl ? (
                            <Avatar src={org.logoUrl} size={72} className="orgLogo" />
                        ) : (
                            <div className="orgLogoPlaceholder">
                                {org?.name ? org.name[0].toUpperCase() : '?'}
                            </div>
                        )}
                        <div className="orgHeroName">{org?.name}</div>
                        {org?.description && (
                            <div className="orgHeroDesc">{org.description}</div>
                        )}
                    </div>

                    <Group>
                        {org?.website && (
                            <SimpleCell before={<Icon24Globe />} multiline>
                                {org.website}
                            </SimpleCell>
                        )}
                        {org?.address && (
                            <SimpleCell before={<Icon24Place />} multiline>
                                {org.address}
                            </SimpleCell>
                        )}
                        {org?.phone && (
                            <SimpleCell before={<Icon24Phone />} multiline>
                                {org.phone}
                            </SimpleCell>
                        )}
                        {org?.email && (
                            <SimpleCell before={<Icon24MailOutline />} multiline>
                                {org.email}
                            </SimpleCell>
                        )}
                        {!org?.website && !org?.address && !org?.phone && !org?.email && (
                            <Div style={{ color: 'var(--vkui--color_text_secondary)', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>
                                {t('noDetails')}
                            </Div>
                        )}
                    </Group>
                </>
            )}
        </Panel>
    );
};

export default OrganizationPanel;
