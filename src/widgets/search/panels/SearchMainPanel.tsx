'use client'

import { Box, CustomScrollView, Panel, PanelHeader, Search, Spinner } from '@vkontakte/vkui';
import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { UserCardList } from "@/entities/user/ui";
import { useSearchUsers } from "@/features/user/search";
import { useTranslations } from 'next-intl';

interface SearchMainPanelProps {
    id: string
}

export const SearchMainPanel: React.FC<SearchMainPanelProps> = ({ id }) => {

    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 20;

    const debouncedSearchText = useDebounce(searchText, 500);

    const {
        data,
        isLoading,
        isFetching
    } = useSearchUsers({
        searchText: debouncedSearchText,
        page,
        pageSize,
        enabled: debouncedSearchText.length >= 2
    });

    const users = data?.items ?? [];
    const totalPages = data?.totalPages ?? 0;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setPage(1);
    };

    const handleUserClick = (user: string) => {
        // Переход на страницу профиля пользователя
        //routeNavigator.push(`/profile/${user.id}`);
    };

    const handleLoadMore = () => {
        if (!isFetching && page < totalPages) {
            setPage(prev => prev + 1);
        }
    };

    const t = useTranslations('search');

    // ...

    return (
        <Panel id={id}>
            <PanelHeader>{t('title')}</PanelHeader>
            <Box>
                <Search
                    value={searchText}
                    onChange={handleSearchChange}
                    placeholder={t('placeholder')}
                    after={isFetching && <Spinner size="s" />}
                />
            </Box>


            <CustomScrollView
                overscrollBehavior="contain"
                onScroll={(e) => {
                    const target = e.currentTarget;
                    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
                        handleLoadMore();
                    }
                }}
            >
                {users.length > 0 ? (
                    <UserCardList
                        users={users}
                        onUserClick={handleUserClick}
                    />
                ) : (
                    !isFetching && debouncedSearchText.length >= 2 && (
                        <Box className="p-4 text-center text-muted-foreground">{t('notFound')}</Box>
                    )
                )}
            </CustomScrollView>

            {isFetching && users.length > 0 && (
                <Box style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                    <Spinner size="s" />
                </Box>
            )}

        </Panel>
    );
};

export default SearchMainPanel;