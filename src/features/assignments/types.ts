export type AssignmentStatus = 'Pending' | 'InProgress' | 'Completed' | 'Overdue' | 'Revoked';

export type AssignmentBriefResponse = {
    id: string;
    courseId: string;
    assigneeId: string;
    deadline?: string | null;
    isRequired: boolean;
    status: AssignmentStatus;
    isOverdue: boolean;
};

export type AssignmentResponse = {
    id: string;
    courseId: string;
    assigneeId: string;
    assignedById: string;
    departmentId?: string | null;
    deadline?: string | null;
    isRequired: boolean;
    status: AssignmentStatus;
    completedAt?: string | null;
    isOverdue: boolean;
    createdAt: string;
};

export type CreateAssignmentRequest = {
    courseId: string;
    assigneeId: string;
    deadline?: string | null;
    isRequired: boolean;
};

export type AssignToDepartmentRequest = {
    courseId: string;
    departmentId: string;
    deadline?: string | null;
    isRequired: boolean;
};

export type AssignmentsFilter = {
    page?: number;
    pageSize?: number;
    courseId?: string;
    userId?: string;
    departmentId?: string;
    status?: AssignmentStatus;
};
