export type NewsPostStatus = 'Draft' | 'Published' | 'Archived';

export type NewsCategoryResponse = {
    id: string;
    name: string;
};

export type NewsPostBriefResponse = {
    id: string;
    title: string;
    preview?: string | null;
    imageUrl?: string | null;
    categoryId: string | null;
    categoryName?: string | null;
    status: NewsPostStatus;
    isPinned: boolean;
    publishedAt: string | null;
    createdAt: string;
    authorName?: string | null;
};

export type NewsPostResponse = {
    id: string;
    title: string;
    content: string;
    imageUrl?: string | null;
    categoryId: string | null;
    category?: NewsCategoryResponse | null;
    status: NewsPostStatus;
    isPinned: boolean;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string | null;
    authorId: string;
    authorName?: string | null;
};

export type CreateNewsPostRequest = {
    title: string;
    content: string;
    categoryId?: string | null;
    imageUrl?: string | null;
};

export type UpdateNewsPostRequest = {
    title: string;
    content: string;
    categoryId?: string | null;
    imageUrl?: string | null;
};

export type CreateNewsCategoryRequest = {
    name: string;
};
