export type DepartmentBriefResponse = {
    id: string;
    name: string;
    managerId?: string | null;
    employeeCount: number;
};

export type DepartmentResponse = {
    id: string;
    name: string;
    description?: string | null;
    managerId?: string | null;
    employeeIds: string[];
    createdAt: string;
};

export type CreateDepartmentRequest = {
    name: string;
    description?: string | null;
    managerId?: string | null;
};

export type UpdateDepartmentRequest = {
    name: string;
    description?: string | null;
    managerId?: string | null;
};

export type AddEmployeeRequest = {
    userId: string;
};
