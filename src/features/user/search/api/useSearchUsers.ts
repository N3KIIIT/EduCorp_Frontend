'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import { userMapper } from '@/entities/user/lib/mappers';
import type { UserPagedResponse } from '@/lib/api-client/types.gen';
import type { PagedRequest, PostApiUsersGetAllResponses } from '@/lib/api-client/types.gen';
import { keepPreviousData } from '@tanstack/react-query';

interface UseSearchUsersOptions {
    searchText: string;
    page?: number;
    pageSize?: number;
    enabled?: boolean;
}

async function searchUsers(
    searchText: string,
    page: number,
    pageSize: number
) {
    const filters = [];

    if (searchText.trim()) {
        filters.push({
            field: 'Name.FirstName',
            operator: 6,
            value: searchText.trim(),
        });
    }

    const requestParams: PagedRequest = {
        page,
        pageSize,
        filters,
    };

    const response = await apiClient.post<PostApiUsersGetAllResponses>({
        url: '/Users/GetAll',
        body: requestParams
    });

    if (!response.data) {
        throw new Error('No data received');
    }

    return response.data;
}


export function useSearchUsers({
    searchText,
    page = 1,
    pageSize = 20,
    enabled = true,
}: UseSearchUsersOptions) {
    const query = useQuery({
        queryKey: ['users', 'search', searchText, page, pageSize],
        queryFn: () => searchUsers(searchText, page, pageSize),
        enabled: enabled && searchText.length >= 2,
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });
    
    const dataItems = (query.data?.items ?? []) as UserPagedResponse[];
    const items = userMapper.toCardModelList(dataItems);

    return {
        ...query,
        data: {
            items,
            totalCount: Number(query.data?.totalCount ?? 0),
            page: Number(query.data?.page ?? page),
            pageSize: Number(query.data?.pageSize ?? pageSize),
            totalPages: Math.ceil(Number(query.data?.totalCount ?? 0) / pageSize),
        }
    };
}
