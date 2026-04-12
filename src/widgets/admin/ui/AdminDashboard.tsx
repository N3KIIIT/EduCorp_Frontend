'use client';

import React, { useState } from 'react';
import {
    Group,
    Header,
    ModalRoot,
    NavIdProps,
    Panel,
    PanelHeader,
    Button,
    Tabs,
    TabsItem,
} from '@vkontakte/vkui';
import {
    Icon24Services,
    Icon24Users,
    Icon24EducationOutline,
    Icon24Add,
} from '@vkontakte/icons';
import { useTranslations } from 'next-intl';
import { TenantManagement } from '@/features/admin/manage-tenants/ui/TenantManagement';
import { DepartmentList } from '@/features/departments/ui/DepartmentList';
import { DepartmentFormModal } from '@/features/departments/ui/DepartmentFormModal';
import { AssignmentList } from '@/features/assignments/ui/AssignmentList';
import { AssignCourseModal } from '@/features/assignments/ui/AssignCourseModal';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useAppContextStore } from '@/shared/lib/navigation/appContextStore';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { ROLES } from '@/entities/session';
import {
    DEPARTMENT_MODAL_IDS,
    ASSIGNMENT_MODAL_IDS,
} from '@/shared/config/navigation/modal-ids';
import { ADMIN_PANEL_IDS } from '@/shared/config/navigation/panel-ids';
import type { DepartmentBriefResponse } from '@/features/departments/types';

type AdminTab = 'tenants' | 'departments' | 'assignments';

export const AdminDashboard: React.FC<NavIdProps> = ({ id }) => {
    const t = useTranslations('admin');
    const [activeTab, setActiveTab] = useState<AdminTab>('tenants');
    const [editingDept, setEditingDept] = useState<DepartmentBriefResponse | undefined>();

    const { activeModal, openModal, closeModal, goToPanel } = useNavigationStore();
    const { setCurrentDepartmentId } = useAppContextStore();

    const handleViewDept = (dept: DepartmentBriefResponse) => {
        setCurrentDepartmentId(dept.id);
        goToPanel(ADMIN_PANEL_IDS.DEPARTMENT_DETAILS);
    };

    const handleEditDept = (dept: DepartmentBriefResponse) => {
        setEditingDept(dept);
        openModal(DEPARTMENT_MODAL_IDS.EDIT);
    };

    const handleModalClose = () => {
        setEditingDept(undefined);
        closeModal();
    };

    const modalRoot = (
        <ModalRoot activeModal={activeModal} onClose={handleModalClose}>
            <DepartmentFormModal
                mode="create"
                onClose={handleModalClose}
                onSuccess={handleModalClose}
            />
            <DepartmentFormModal
                mode="edit"
                department={editingDept}
                onClose={handleModalClose}
                onSuccess={handleModalClose}
            />
            <AssignCourseModal
                onClose={handleModalClose}
                onSuccess={handleModalClose}
            />
        </ModalRoot>
    );

    return (
        <Panel id={id}>
            {modalRoot}
            <PanelHeader>{t('dashboard.title')}</PanelHeader>

            <Tabs mode="secondary" layoutFillMode="stretched">
                <TabsItem
                    selected={activeTab === 'tenants'}
                    onClick={() => setActiveTab('tenants')}
                    before={<Icon24Services />}
                >
                    {t('dashboard.tenantsTab')}
                </TabsItem>
                <TabsItem
                    selected={activeTab === 'departments'}
                    onClick={() => setActiveTab('departments')}
                    before={<Icon24Users />}
                >
                    {t('dashboard.departmentsTab')}
                </TabsItem>
                <TabsItem
                    selected={activeTab === 'assignments'}
                    onClick={() => setActiveTab('assignments')}
                    before={<Icon24EducationOutline />}
                >
                    {t('dashboard.assignmentsTab')}
                </TabsItem>
            </Tabs>

            {activeTab === 'tenants' && (
                <Group>
                    <TenantManagement />
                </Group>
            )}

            {activeTab === 'departments' && (
                <DepartmentList
                    onView={handleViewDept}
                    onEdit={handleEditDept}
                    onCreate={() => openModal(DEPARTMENT_MODAL_IDS.CREATE)}
                />
            )}

            {activeTab === 'assignments' && (
                <Group
                    header={
                        <Header
                            after={
                                <PermissionGuard roles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]}>
                                    <Button
                                        size="s"
                                        before={<Icon24Add />}
                                        onClick={() => openModal(ASSIGNMENT_MODAL_IDS.ASSIGN_COURSE)}
                                    >
                                        {t('dashboard.assignCourse')}
                                    </Button>
                                </PermissionGuard>
                            }
                        >
                            {t('dashboard.assignmentsTab')}
                        </Header>
                    }
                >
                    <AssignmentList />
                </Group>
            )}
        </Panel>
    );
};
