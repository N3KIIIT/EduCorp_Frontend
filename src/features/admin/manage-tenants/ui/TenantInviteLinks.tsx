'use client';

import React, {useState} from 'react';
import {
    Group,
    Box,
    Card,
    Button,
    Select,
    Placeholder,
    Spinner,
} from '@vkontakte/vkui';
import {Icon24Copy, Icon24Cancel} from '@vkontakte/icons';
import {useTranslations} from 'next-intl';
import {InviteStatus} from '@/lib/api-client/types.gen';
import {useInfiniteInviteLinks, useRevokeInviteLink} from '../api/invite-api';
import CreateInviteModal from './CreateInviteModal';

interface TenantInviteLinksProps {
    tenantId: string;
}

const PAGE_SIZE = 10;

const TenantInviteLinks: React.FC<TenantInviteLinksProps> = ({tenantId}) => {
    const t = useTranslations('admin.tenants.inviteLinks');
    const [statusFilter, setStatusFilter] = useState<InviteStatus | undefined>('Active');
    const [sortConfig, setSortConfig] = useState<{ field: string; isDescending: boolean }>({
        field: 'CreatedAt',
        isDescending: true,
    });
    const [showCreateModal, setShowCreateModal] = useState(false);

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteInviteLinks(tenantId, PAGE_SIZE, statusFilter, sortConfig.field, sortConfig.isDescending);

    const revokeLink = useRevokeInviteLink(tenantId);

    const observer = React.useRef<IntersectionObserver | null>(null);
    const lastElementRef = React.useCallback(
        (node: HTMLDivElement | null) => {
            if (isLoading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            });
            if (node) observer.current.observe(node);
        },
        [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]
    );

    const handleRevoke = (token: string) => {
        revokeLink.mutate(token);
    };

    const handleCopy = (link: string) => {
        navigator.clipboard.writeText(link);
    };

    const getStatusColor = (status: InviteStatus): string => {
        switch (status) {
            case 'Active':
                return '#4bb34b';
            case 'Exhausted':
                return '#ffa000';
            case 'Revoked':
                return '#e64646';
            default:
                return '#99a2ad';
        }
    };

    const filterOptions = [
        {value: '', label: t('filterAll')},
        {value: 'Active', label: t('statusActive')},
        {value: 'Exhausted', label: t('statusExhausted')},
        {value: 'Revoked', label: t('statusRevoked')},
    ];

    const sortOptions = [
        {value: 'CreatedAt:desc', label: t('sortNewest')},
        {value: 'CreatedAt:asc', label: t('sortOldest')},
        {value: 'CoutOfUsage:desc', label: t('sortUsageDesc')},
        {value: 'CoutOfUsage:asc', label: t('sortUsageAsc')},
    ];

    if (isLoading) {
        return <Placeholder><Spinner size="m"/></Placeholder>;
    }

    return (
        <Group>
            <Box style={{display: 'flex', gap: 8, padding: '0 16px', flexWrap: 'wrap'}}>
                <Box style={{width: 150}}>
                    <Select
                        value={statusFilter ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            setStatusFilter(val ? (val as InviteStatus) : undefined);
                        }}
                        options={filterOptions}
                    />
                </Box>
                <Box style={{width: 180}}>
                    <Select
                        value={`${sortConfig.field}:${sortConfig.isDescending ? 'desc' : 'asc'}`}
                        onChange={(e) => {
                            const [field, dir] = e.target.value.split(':');
                            setSortConfig({field, isDescending: dir === 'desc'});
                        }}
                        options={sortOptions}
                    />
                </Box>
                <Box style={{flexGrow: 1}} />
                <Button
                    size="m"
                    mode="primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    {t('create')}
                </Button>
            </Box>

            {(!data?.pages || (data.pages[0] as any)?.items?.length === 0) ? (
                <Placeholder>{t('empty')}</Placeholder>
            ) : (
                <Box style={{padding: 16}}>
                    <Box style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto',
                        gap: 8,
                        padding: '8px 12px',
                        fontWeight: 600,
                        fontSize: 13,
                        color: '#99a2ad',
                    }}>
                        <span>{t('columnLink')}</span>
                        <span>{t('columnUsage')}</span>
                        <span>{t('columnStatus')}</span>
                    </Box>

                    {data?.pages.map((page: any, pageIndex) => (
                        <React.Fragment key={pageIndex}>
                            {page.items?.map((link: any, linkIndex: number) => {
                                const isLastItem = 
                                    pageIndex === (data?.pages.length ?? 0) - 1 && 
                                    linkIndex === (page.items?.length ?? 0) - 1;
                                
                                return (
                                    <div ref={isLastItem ? lastElementRef : null} key={link.tenantLinkId}>
                                        <Card mode="outline" style={{marginBottom: 8}}>
                                            <Box style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr auto auto',
                                                gap: 8,
                                                padding: 12,
                                                alignItems: 'center',
                                            }}>
                                                <Box style={{display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden'}}>
                                                    <span style={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        fontSize: 14,
                                                    }}>
                                                        {link.inviteLink}
                                                    </span>
                                                    <Button
                                                        size="s"
                                                        mode="tertiary"
                                                        before={<Icon24Copy/>}
                                                        onClick={() => handleCopy(link.inviteLink)}
                                                    />
                                                </Box>

                                                <span style={{fontSize: 14, textAlign: 'center', minWidth: 60}}>
                                                    {String(link.coutOfUsage)} / {String(link.maxUses)}
                                                </span>

                                                <Box style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                                    <span style={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: getStatusColor(link.status),
                                                    }}>
                                                        {t(`status${link.status}`)}
                                                    </span>
                                                    {link.status === 'Active' && (
                                                        <Button
                                                            size="s"
                                                            mode="tertiary"
                                                            appearance="negative"
                                                            before={<Icon24Cancel/>}
                                                            loading={revokeLink.isPending}
                                                            onClick={() => handleRevoke(link.tenantLinkId)}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        </Card>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}

                    {isFetchingNextPage && (
                        <Box style={{display: 'flex', justifyContent: 'center', padding: 16}}>
                            <Spinner size="m"/>
                        </Box>
                    )}
                </Box>
            )}

            {showCreateModal && (
                <CreateInviteModal
                    tenantId={tenantId}
                    onClose={() => setShowCreateModal(false)}
                />
            )}
        </Group>
    );
};

export default TenantInviteLinks;
