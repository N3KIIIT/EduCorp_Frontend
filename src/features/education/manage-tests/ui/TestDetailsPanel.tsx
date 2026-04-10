'use client';

import React, { useState } from 'react';
import {
    Button,
    Group,
    ModalRoot,
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Tabs,
    TabsItem,
    Div,
    Title,
    Caption,
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
import '@/features/education/education.css';

interface TestDetailsPanelProps {
    id: string;
}

function getTestVariant(title: string): number {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = (hash * 31 + title.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash) % 8;
}

function getTestTypeEmoji(type: string): string {
    switch (type?.toLowerCase()) {
        case 'quiz': return '🧠';
        case 'practice': return '💪';
        case 'exam': return '🎓';
        case 'survey': return '📊';
        default: return '📝';
    }
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
                onClose={closeModal}
            />
        </ModalRoot>
    );

    const test = testQuery.data;
    const variant = test ? getTestVariant(t(`testType.${test.type}`)) : 0;
    const emoji = test ? getTestTypeEmoji(test.type) : '📝';

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
                transparent
            >
                {test ? t(`testType.${test.type}`) : t('details')}
            </PanelHeader>

            {test && (
                <>
                    {/* Hero banner */}
                    <div className={`heroHero heroHero--${variant}`}>
                        <div className="heroTitle">{emoji} {t(`testType.${test.type}`)}</div>
                        <div className="heroMeta">
                            {test.passingScore && (
                                <span className="heroBadge">
                                    {t('passingScore')}: {test.passingScore}%
                                </span>
                            )}
                            {test.timeLimitSeconds && (
                                <span className="heroBadge">
                                    ⏱ {Math.round(Number(test.timeLimitSeconds) / 60)} {t('minutes')}
                                </span>
                            )}
                            {test.questions?.length > 0 && (
                                <span className="heroBadge">
                                    {test.questions.length} {t('questions')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <Group style={{ marginTop: 12 }}>
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
                            <TabsItem
                                selected={false}
                                onClick={() => goToPanel(TEST_PANEL_IDS.ATTEMPTS)}
                            >
                                {t('attemptsTab')}
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
                                onClick={() => goToPanel(TEST_PANEL_IDS.TAKE)}
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
