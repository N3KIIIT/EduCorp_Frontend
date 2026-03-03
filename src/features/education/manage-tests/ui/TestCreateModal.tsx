'use client';

import React, { useState } from 'react';
import {
    ModalPage,
    ModalPageHeader,
    FormItem,
    Input,
    Button,
    Select,
    Group,
    Switch, Header,
} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useCreateTest } from '../api/test-api';
import type { CreateTestRequest, TestType } from '@/lib/api-client/types.gen';
import {TEST_MODAL_IDS} from "@/shared/config/navigation/modal-ids";

interface TestCreateModalProps {
    courseId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

const TEST_TYPES: Array<{ value: TestType; label: string }> = [
    { value: 'Practice', label: 'Практический' },
    { value: 'Control', label: 'Контрольный' },
];

export const TestCreateModal: React.FC<TestCreateModalProps> = ({ courseId, onClose, onSuccess }) => {
    const t = useTranslations('education.tests.modal');
    const [testType, setTestType] = useState<TestType>('Practice');
    const [passingScore, setPassingScore] = useState('70');
    const [durationInMinutes, setDurationInMinutes] = useState('');
    const [shuffleQuestions, setShuffleQuestions] = useState(false);
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
    const [allowPause, setAllowPause] = useState(true);
    const createTest = useCreateTest();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const request: CreateTestRequest = {
                type: testType,
                courseId,
                passingScore: parseInt(passingScore, 10),
                durationInMinutes: durationInMinutes ? parseInt(durationInMinutes, 10) : null,
            };
            await createTest.mutateAsync(request);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to create test:', error);
        }
    };

    const resetForm = () => {
        setTestType('Practice');
        setPassingScore('70');
        setDurationInMinutes('');
        setShuffleQuestions(false);
        setShowCorrectAnswers(false);
        setAllowPause(true);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <ModalPage
            id={TEST_MODAL_IDS.CREATE}
            header={<ModalPageHeader>{t('createTitle')}</ModalPageHeader>}
            onClose={handleClose}
        >
            <form onSubmit={handleSubmit}>
                <Group>
                    <FormItem top={t('testType')} htmlFor="testType">
                        <Select
                            id="testType"
                            value={testType}
                            onChange={(e) => setTestType(e.target.value as TestType)}
                            options={TEST_TYPES}
                        />
                    </FormItem>
                    <FormItem top={t('passingScore')} htmlFor="passingScore">
                        <Input
                            id="passingScore"
                            type="number"
                            value={passingScore}
                            onChange={(e) => setPassingScore(e.target.value)}
                            min={0}
                            max={100}
                            placeholder={t('passingScorePlaceholder')}
                        />
                    </FormItem>
                    <FormItem top={t('durationInMinutes')} htmlFor="durationInMinutes">
                        <Input
                            id="durationInMinutes"
                            type="number"
                            value={durationInMinutes}
                            onChange={(e) => setDurationInMinutes(e.target.value)}
                            min={1}
                            placeholder={t('durationInMinutesPlaceholder')}
                        />
                    </FormItem>
                    
                    <Header subtitle={t('policySubtitle')}>
                        {t('testPolicy')}
                    </Header>
                    
                    <FormItem top={t('shuffleQuestions')}>
                        <Switch
                            checked={shuffleQuestions}
                            onChange={(e) => setShuffleQuestions(e.target.checked)}
                        >
                           
                        </Switch>
                    </FormItem>
                    <FormItem top={t('showCorrectAnswers')}>
                        <Switch 
                            checked={showCorrectAnswers}
                            onChange={(e) => setShowCorrectAnswers(e.target.checked)}
                        >
                            
                        </Switch>
                    </FormItem>
                    <FormItem top={t('allowPause')}>
                        <Switch
                            checked={allowPause}
                            onChange={e=> setAllowPause(e.target.checked)}
                        >
                            
                        </Switch>
                    </FormItem>
                </Group>

                <div style={{ padding: '16px', display: 'flex', gap: 8 }}>
                    <Button
                        size="l"
                        stretched
                        type="submit"
                        loading={createTest.isPending}
                    >
                        {t('save')}
                    </Button>
                    <Button
                        size="l"
                        stretched
                        mode="secondary"
                        onClick={handleClose}
                    >
                        {t('cancel')}
                    </Button>
                </div>
            </form>
        </ModalPage>
    );
};
