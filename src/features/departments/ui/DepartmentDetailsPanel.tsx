'use client';

import React, { useState } from 'react';
import {
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Group,
    Header,
    Placeholder,
    Spinner,
    Button,
    SimpleCell,
    Div,
    ModalRoot,
    Tabs,
    TabsItem,
    NavIdProps,
} from '@vkontakte/vkui';
import {
    Icon24Users,
    Icon24DeleteOutline,
    Icon24Add,
    Icon24EducationOutline,
} from '@vkontakte/icons';
import { useTranslations } from 'next-intl';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useAppContextStore } from '@/shared/lib/navigation/appContextStore';
import { useDepartment, useRemoveEmployee } from '../api/department-api';
import { AddEmployeeModal } from './AddEmployeeModal';
import { DEPARTMENT_MODAL_IDS, ASSIGNMENT_MODAL_IDS } from '@/shared/config/navigation/modal-ids';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { ROLES } from '@/entities/session';
import { AssignmentList } from '@/features/assignments/ui/AssignmentList';
import { AssignCourseModal } from '@/features/assignments/ui/AssignCourseModal';
import '../departments.css';

export const DepartmentDetailsPanel: React.FC<NavIdProps> = ({ id }) => {
    const t = useTranslations('departments');
    const { goBackPanel, activeModal, openModal, closeModal } = useNavigationStore();
    const { currentDepartmentId } = useAppContextStore();
    const { data: dept, isLoading } = useDepartment(currentDepartmentId ?? '');
    const removeEmployee = useRemoveEmployee();

    const [activeTab, setActiveTab] = useState<'employees' | 'assignments'>('employees');

    const handleRemoveEmployee = (userId: string) => {
        if (!currentDepartmentId) return;
        if (window.confirm(t('removeEmployeeConfirm'))) {
            removeEmployee.mutate({ departmentId: currentDepartmentId, userId });
        }
    };

    const modalRoot = (
        <ModalRoot activeModal={activeModal} onClose={closeModal}>
            <AddEmployeeModal
                departmentId={currentDepartmentId ?? ''}
                onClose={closeModal}
                onSuccess={closeModal}
            />
            <AssignCourseModal
                targetType="department"
                targetId={currentDepartmentId ?? ''}
                onClose={closeModal}
                onSuccess={closeModal}
            />
        </ModalRoot>
    );

    if (isLoading) {
        return (
            <Panel id={id}>
                <PanelHeader before={<PanelHeaderBack onClick={goBackPanel} />}>
                    {t('details.title')}
                </PanelHeader>
                <Div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                    <Spinner size="m" />
                </Div>
            </Panel>
        );
    }

    if (!dept) {
        return (
            <Panel id={id}>
                <PanelHeader before={<PanelHeaderBack onClick={goBackPanel} />}>
                    {t('details.title')}
                </PanelHeader>
                <Placeholder>{t('details.notFound')}</Placeholder>
            </Panel>
        );
    }

    return (
        <Panel id={id}>
            {modalRoot}
            <PanelHeader before={<PanelHeaderBack onClick={goBackPanel} />}>
                {dept.name}
            </PanelHeader>

            {/* Hero */}
            <div className="deptHero">
                <div className="deptHeroAvatar">{dept.name.charAt(0).toUpperCase()}</div>
                <div className="deptHeroInfo">
                    <div className="deptHeroName">{dept.name}</div>
                    {dept.description && (
                        <div className="deptHeroDesc">{dept.description}</div>
                    )}
                </div>
            </div>

            <Tabs mode="secondary" layoutFillMode="stretched">
                <TabsItem
                    selected={activeTab === 'employees'}
                    onClick={() => setActiveTab('employees')}
                    before={<Icon24Users />}
                >
                    {t('details.employeesTab')} ({dept.employeeIds.length})
                </TabsItem>
                <TabsItem
                    selected={activeTab === 'assignments'}
                    onClick={() => setActiveTab('assignments')}
                    before={<Icon24EducationOutline />}
                >
                    {t('details.assignmentsTab')}
                </TabsItem>
            </Tabs>

            {activeTab === 'employees' && (
                <Group
                    header={
                        <Header
                            after={
                                <PermissionGuard roles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]}>
                                    <Button
                                        size="s"
                                        before={<Icon24Add />}
                                        onClick={() => openModal(DEPARTMENT_MODAL_IDS.ADD_EMPLOYEE)}
                                    >
                                        {t('details.addEmployee')}
                                    </Button>
                                </PermissionGuard>
                            }
                        >
                            {t('details.employeesTab')}
                        </Header>
                    }
                >
                    {dept.employeeIds.length === 0 ? (
                        <Placeholder icon={<Icon24Users />}>{t('details.noEmployees')}</Placeholder>
                    ) : (
                        dept.employeeIds.map((userId) => (
                            <SimpleCell
                                key={userId}
                                after={
                                    <PermissionGuard roles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]}>
                                        <Button
                                            size="s"
                                            mode="secondary"
                                            appearance="negative"
                                            before={<Icon24DeleteOutline />}
                                            onClick={() => handleRemoveEmployee(userId)}
                                            loading={removeEmployee.isPending}
                                        />
                                    </PermissionGuard>
                                }
                            >
                                <span style={{ fontFamily: 'monospace', fontSize: 13 }}>
                                    {userId}
                                </span>
                            </SimpleCell>
                        ))
                    )}
                </Group>
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
                                        {t('details.assignCourse')}
                                    </Button>
                                </PermissionGuard>
                            }
                        >
                            {t('details.assignmentsTab')}
                        </Header>
                    }
                >
                    <AssignmentList departmentId={currentDepartmentId ?? ''} />
                </Group>
            )}
        </Panel>
    );
};
