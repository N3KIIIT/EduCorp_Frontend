export type OrganizationInfoResponse = {
    id?: string;
    name: string;
    description?: string | null;
    logoUrl?: string | null;
    website?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
};

export type UpdateOrganizationInfoRequest = {
    name: string;
    description?: string | null;
    logoUrl?: string | null;
    website?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
};
