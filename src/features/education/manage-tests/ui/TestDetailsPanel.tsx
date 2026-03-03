'use client';

import React, { useState } from 'react';
import {
    Button,
    Group,
    ModalRoot,
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Title,
    Tabs,
    TabsItem,
    Div,
    Headline,
    Caption,
    Card,
    CardGrid,
    Box,
    Chip,
} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useTest } from '../api/test-api';
import { QuestionList } from './QuestionList';
import { QuestionCreateModal } from './QuestionCreateModal';
import { useAppContextStore } from '@/shared/lib/navigation/appContextStore';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { ROLES } from '@/entities/session';
import { TEST_PANEL_IDS } from '@/shared/config/navigation/panel-ids';
import './test-take.css';

interface TestDetailsPanelProps {
    id: string;
}

export const TestDetailsPanel: React.FC<TestDetailsPanelProps> = ({ id }) => {
    const t = useTranslations('education.tests');
    const { goBackPanel, activeModal, closeModal, openModal, goToPanel } = useNavigationStore();
    const { currentTestId } = useAppContextStore();
    const testQuery = useTest(currentTestId || '');

    const [activeTab, setActiveTab] = useState<'questions' | 'take'>('questions');

    const modalRoot = (
        <ModalRoot activeModal={activeModal} onClose={closeModal}>
            <QuestionCreateModal
                testId={currentTestId!}
                onClose={() => {
                    closeModal();
                }}
            />
        </ModalRoot>
    );

    const handleStartTest = () => {
        goToPanel(TEST_PANEL_IDS.TAKE);
    };

    return (
        <Panel id={id}>
            {modalRoot}
            <PanelHeader
                before={<PanelHeaderBack onClick={goBackPanel} />}
                after={
                    <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                        <Button
                            size="s"
                            mode="primary"
                            onClick={() => openModal('question-create')}
                        >
                            {t('addQuestion')}
                        </Button>
                    </PermissionGuard>
                }
            >
                {testQuery.data?.title || t('details')}
            </PanelHeader>

            {testQuery.isLoading && <Title level="2">{t('loading')}</Title>}
            {testQuery.error && <Title level="2">{t('errorLoading')}</Title>}
            {testQuery.data && (
                <>
                    <Group>
                        <Card mode="shadow">
                            <Box style={{ padding: 12 }}>
                                <Headline level="1" weight="2">
                                    {testQuery.data.title || t(`testType.${testQuery.data.type}`)}
                                </Headline>
                                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                    <Chip>{t(`testType.${testQuery.data.type}`)}</Chip>
                                    <Chip>
                                        {t('passingScore')}: {testQuery.data.passingScore}%
                                    </Chip>
                                    {testQuery.data.durationInMinutes && (
                                        <Chip>
                                            {t('duration')}: {testQuery.data.durationInMinutes} {t('minutes')}
                                        </Chip>
                                    )}
                                    {testQuery.data.questionsCount && (
                                        <Chip>
                                            {testQuery.data.questionsCount} {t('questions')}
                                        </Chip>
                                    )}
                                </div>
                                {testQuery.data.description && (
                                    <Div style={{ marginTop: 12 }}>
                                        <Caption>{testQuery.data.description}</Caption>
                                    </Div>
                                )}
                            </Box>
                        </Card>
                    </Group>

                    <Group>
                        <Tabs>
                            <TabsItem
                                selected={activeTab === 'questions'}
                                onClick={() => setActiveTab('questions')}
                            >
                                {t('questionsTab')}
                            </TabsItem>
                            <TabsItem
                                selected={activeTab === 'take'}
                                onClick={() => setActiveTab('take')}
                            >
                                {t('takeTestTab')}
                            </TabsItem>
                        </Tabs>
                    </Group>

                    {activeTab === 'questions' && (
                        <QuestionList
                            testId={currentTestId!}
                            onEditQuestion={(questionId) => {
                                console.log('Edit question:', questionId);
                            }}
                        />
                    )}

                    {activeTab === 'take' && (
                        <Div style={{ padding: 16 }}>
                            <Title level="2">{t('takeTestInstructions')}</Title>
                            <Div style={{ marginTop: 12 }}>
                                <Caption>{t('takeTestDescription')}</Caption>
                            </Div>
                            <Button
                                size="l"
                                mode="primary"
                                style={{ marginTop: 16, width: '100%' }}
                                onClick={handleStartTest}
                            >
                                {t('startTest')}
                            </Button>
                        </Div>
                    )}
                </>
            )}
        </Panel>
    );
};
