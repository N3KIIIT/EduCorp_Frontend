'use client';

import React, { useState, useMemo } from 'react';
import {
    ModalPage,
    ModalPageHeader,
    FormItem,
    Select,
    Textarea,
    Input,
    Button,
    Checkbox,
    Group,
    Header,
    IconButton,
    usePlatform,
    Caption,
} from '@vkontakte/vkui';
import { Icon24Add, Icon24Delete } from '@vkontakte/icons';
import { useTranslations } from 'next-intl';
import { useCreateQuestion } from '../api/question-api';
import type {
    AddQuestionRequest,
    IQuestionDataRequest,
    ChoiceOptionRequest,
    QuestionDataType,
    MatchingItemRequest,
    OrderingItemRequest,
} from '@/lib/api-client/types.gen';
import './test-take.css';

interface QuestionCreateModalProps {
    testId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export const QuestionCreateModal: React.FC<QuestionCreateModalProps> = ({
    testId,
    onClose,
    onSuccess,
}) => {
    const t = useTranslations('education.questions.modal');
    const platform = usePlatform();

    const QUESTION_TYPES: Array<{ value: QuestionDataType; label: string }> = [
        { value: 'SingleChoice', label: t('questionTypes.SingleChoice') },
        { value: 'MultipleChoice', label: t('questionTypes.MultipleChoice') },
        { value: 'Text', label: t('questionTypes.Text') },
        { value: 'Numeric', label: t('questionTypes.Numeric') },
        { value: 'Matching', label: t('questionTypes.Matching') },
        { value: 'Ordering', label: t('questionTypes.Ordering') },
        { value: 'FillInTheBlank', label: t('questionTypes.FillInTheBlank') },
    ];
    const [questionType, setQuestionType] = useState<QuestionDataType>('SingleChoice');
    const [questionText, setQuestionText] = useState('');
    const [description, setDescription] = useState('');
    const [points, setPoints] = useState(1);
    const [orderIndex, setOrderIndex] = useState(0);
    const [hint, setHint] = useState('');
    const [explanation, setExplanation] = useState('');

    // Single/Multiple choice options
    const [options, setOptions] = useState<Array<ChoiceOptionRequest & { id: string }>>([
        { id: 'opt-1', text: '', isCorrect: false, feedback: null },
        { id: 'opt-2', text: '', isCorrect: false, feedback: null },
    ]);
    const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
    const [correctOptionIndices, setCorrectOptionIndices] = useState<number[]>([]);

    // Text question settings
    const [acceptableAnswers, setAcceptableAnswers] = useState<string[]>(['']);
    const [caseSensitive, setCaseSensitive] = useState(false);

    // Numeric question settings
    const [numericAnswer, setNumericAnswer] = useState('');
    const [allowDecimal, setAllowDecimal] = useState(false);
    const [tolerance, setTolerance] = useState('');

    // Matching question settings
    const [leftItems, setLeftItems] = useState<Array<MatchingItemRequest & { id: string }>>([
        { id: 'left-1', text: '', imageUrl: null },
        { id: 'left-2', text: '', imageUrl: null },
    ]);
    const [rightItems, setRightItems] = useState<Array<MatchingItemRequest & { id: string }>>([
        { id: 'right-1', text: '', imageUrl: null },
        { id: 'right-2', text: '', imageUrl: null },
    ]);
    const [correctMatches, setCorrectMatches] = useState<Record<string, number>>({});

    // Ordering question settings
    const [orderingItems, setOrderingItems] = useState<Array<OrderingItemRequest & { id: string }>>([
        { id: 'ord-1', text: '', imageUrl: null },
        { id: 'ord-2', text: '', imageUrl: null },
    ]);

    // FillInTheBlank question settings
    const [blankAnswers, setBlankAnswers] = useState<Record<string, string[]>>({});

    const createQuestion = useCreateQuestion();

    const addOption = () => {
        setOptions([...options, { id: `opt-${Date.now()}`, text: '', isCorrect: false, feedback: null }]);
    };

    const removeOption = (id: string) => {
        if (options.length <= 2) return;
        setOptions(options.filter(opt => opt.id !== id));
    };

    const updateOption = (id: string, field: keyof ChoiceOptionRequest, value: string | boolean | null) => {
        setOptions(options.map(opt =>
            opt.id === id ? { ...opt, [field]: value } : opt
        ));
    };

    const buildQuestionData = useMemo((): IQuestionDataRequest => {
        const baseData = {
            questionText,
            description: description || null,
            hint: hint || null,
            explanation: explanation || null,
            tags: null,
            media: null,
        };

        switch (questionType) {
            case 'SingleChoice':
                return {
                    type: 'SingleChoice',
                    ...baseData,
                    options: options.map(opt => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                        feedback: opt.feedback,
                    })),
                    correctOptionIndex,
                };
            case 'MultipleChoice':
                return {
                    type: 'MultipleChoice',
                    ...baseData,
                    options: options.map(opt => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                        feedback: opt.feedback,
                    })),
                    correctOptionIndices,
                    minSelections: null,
                    maxSelections: null,
                };
            case 'Text':
                return {
                    type: 'Text',
                    ...baseData,
                    acceptableAnswers,
                    settings: {
                        caseSensitive,
                        trimWhitespace: true,
                        allowPartialMatch: false,
                        partialMatchThreshold: 1,
                    },
                };
            case 'Numeric':
                return {
                    type: 'Numeric',
                    ...baseData,
                    correctAnswer: parseFloat(numericAnswer) || 0,
                    settings: {
                        allowDecimal,
                        tolerance: tolerance ? parseFloat(tolerance) : undefined,
                    },
                };
            case 'Matching':
                return {
                    type: 'Matching',
                    ...baseData,
                    leftItems: leftItems.map(({ text, imageUrl }) => ({ text, imageUrl })),
                    rightItems: rightItems.map(({ text, imageUrl }) => ({ text, imageUrl })),
                    correctMatches: Object.fromEntries(
                        Object.entries(correctMatches).map(([k, v]) => [k, v])
                    ),
                };
            case 'Ordering':
                return {
                    type: 'Ordering',
                    ...baseData,
                    items: orderingItems.map(({ text, imageUrl }) => ({ text, imageUrl })),
                    correctOrder: orderingItems.map((_, i) => i),
                };
            case 'FillInTheBlank': {
                // Parse question text for {{blank_key}} patterns
                const blankKeyPattern = /\{\{(\w+)\}\}/g;
                const foundKeys: string[] = [];
                let match;
                while ((match = blankKeyPattern.exec(questionText)) !== null) {
                    foundKeys.push(match[1]);
                }
                const correctAnswers: Record<string, string[]> = {};
                foundKeys.forEach((key) => {
                    correctAnswers[key] = blankAnswers[key] || [''];
                });
                return {
                    type: 'FillInTheBlank',
                    ...baseData,
                    correctAnswers,
                };
            }
            default:
                return { type: 'SingleChoice', questionText: '', options: [], correctOptionIndex: 0 };
        }
    }, [
        questionType,
        questionText,
        description,
        hint,
        explanation,
        options,
        correctOptionIndex,
        correctOptionIndices,
        acceptableAnswers,
        caseSensitive,
        numericAnswer,
        allowDecimal,
        tolerance,
    ]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const request: AddQuestionRequest = {
                testId,
                data: buildQuestionData,
                points,
                orderIndex,
            };
            await createQuestion.mutateAsync(request);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to create question:', error);
        }
    };

    const resetForm = () => {
        setQuestionType('SingleChoice');
        setQuestionText('');
        setDescription('');
        setPoints(1);
        setOrderIndex(0);
        setHint('');
        setExplanation('');
        setOptions([
            { id: 'opt-1', text: '', isCorrect: false, feedback: null },
            { id: 'opt-2', text: '', isCorrect: false, feedback: null },
        ]);
        setCorrectOptionIndex(0);
        setCorrectOptionIndices([]);
        setAcceptableAnswers(['']);
        setCaseSensitive(false);
        setNumericAnswer('');
        setAllowDecimal(false);
        setTolerance('');
        setLeftItems([
            { id: 'left-1', text: '', imageUrl: null },
            { id: 'left-2', text: '', imageUrl: null },
        ]);
        setRightItems([
            { id: 'right-1', text: '', imageUrl: null },
            { id: 'right-2', text: '', imageUrl: null },
        ]);
        setCorrectMatches({});
        setOrderingItems([
            { id: 'ord-1', text: '', imageUrl: null },
            { id: 'ord-2', text: '', imageUrl: null },
        ]);
        setBlankAnswers({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const isChoiceType = questionType === 'SingleChoice' || questionType === 'MultipleChoice';

    return (
        <ModalPage
            id="question-create"
            header={<ModalPageHeader>{t('createTitle')}</ModalPageHeader>}
            onClose={handleClose}
        >
            <form onSubmit={handleSubmit}>
                <Group>
                    <FormItem top={t('questionType')} htmlFor="questionType">
                        <Select
                            id="questionType"
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value as QuestionDataType)}
                            options={QUESTION_TYPES}
                        />
                    </FormItem>

                    <FormItem top={t('questionText')} htmlFor="questionText">
                        <Textarea
                            id="questionText"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            rows={3}
                            placeholder={t('questionTextPlaceholder')}
                            required
                        />
                    </FormItem>

                    <FormItem top={t('description')} htmlFor="description">
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            placeholder={t('descriptionPlaceholder')}
                        />
                    </FormItem>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <FormItem top={t('points')} htmlFor="points" style={{ flex: 1 }}>
                            <Input
                                id="points"
                                type="number"
                                value={points}
                                onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                                min={1}
                            />
                        </FormItem>
                        <FormItem top={t('orderIndex')} htmlFor="orderIndex" style={{ flex: 1 }}>
                            <Input
                                id="orderIndex"
                                type="number"
                                value={orderIndex}
                                onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
                                min={0}
                            />
                        </FormItem>
                    </div>

                    {isChoiceType && (
                        <>
                            <Header>
                                {t('answerOptions')}
                            </Header>
                            <Caption style={{ padding: '0 16px 8px', color: 'var(--vkui--color_text_secondary)' }}>
                                {t('optionsSubtitle')}
                            </Caption>
                            {options.map((option, index) => (
                                <div key={option.id} style={{
                                    padding: '8px 0',
                                    border: '1px solid var(--vkui--color_separator_primary)',
                                    borderRadius: 8,
                                    marginBottom: 8
                                }}>
                                    <FormItem top={`${t('optionLabel')} ${index + 1}`}>
                                        <Input
                                            value={option.text}
                                            onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                                            placeholder={t('optionTextPlaceholder')}
                                        />
                                    </FormItem>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 16px' }}>
                                        {questionType === 'SingleChoice' ? (
                                            <Checkbox
                                                checked={correctOptionIndex === index}
                                                onChange={() => setCorrectOptionIndex(index)}
                                            >
                                                {t('correctAnswer')}
                                            </Checkbox>
                                        ) : (
                                            <Checkbox
                                                checked={correctOptionIndices.includes(index)}
                                                onChange={(checked) => {
                                                    if (checked) {
                                                        setCorrectOptionIndices([...correctOptionIndices, index]);
                                                    } else {
                                                        setCorrectOptionIndices(correctOptionIndices.filter(i => i !== index));
                                                    }
                                                }}
                                            >
                                                {t('correctAnswer')}
                                            </Checkbox>
                                        )}
                                        <IconButton
                                            onClick={() => removeOption(option.id)}
                                            disabled={options.length <= 2}
                                            aria-label={t('removeOption')}
                                        >
                                            <Icon24Delete />
                                        </IconButton>
                                    </div>
                                    <FormItem top={t('feedback')} style={{ marginTop: 8 }}>
                                        <Input
                                            value={option.feedback || ''}
                                            onChange={(e) => updateOption(option.id, 'feedback', e.target.value)}
                                            placeholder={t('feedbackPlaceholder')}
                                        />
                                    </FormItem>
                                </div>
                            ))}
                            <Button
                                mode="secondary"
                                before={<Icon24Add />}
                                onClick={addOption}
                                stretched
                            >
                                {t('addOption')}
                            </Button>
                        </>
                    )}

                    {questionType === 'Text' && (
                        <>
                            <Header>
                                {t('acceptableAnswers')}
                            </Header>
                            <Caption style={{ padding: '0 16px 8px', color: 'var(--vkui--color_text_secondary)' }}>
                                {t('acceptableAnswersSubtitle')}
                            </Caption>
                            {acceptableAnswers.map((answer, index) => (
                                <FormItem key={index} top={`${t('answerVariantLabel')} ${index + 1}`}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <Input
                                            value={answer}
                                            onChange={(e) => {
                                                const newAnswers = [...acceptableAnswers];
                                                newAnswers[index] = e.target.value;
                                                setAcceptableAnswers(newAnswers);
                                            }}
                                            placeholder={t('answerPlaceholder')}
                                        />
                                        {acceptableAnswers.length > 1 && (
                                            <IconButton
                                                onClick={() => setAcceptableAnswers(acceptableAnswers.filter((_, i) => i !== index))}
                                            >
                                                <Icon24Delete />
                                            </IconButton>
                                        )}
                                    </div>
                                </FormItem>
                            ))}
                            <Button
                                mode="secondary"
                                before={<Icon24Add />}
                                onClick={() => setAcceptableAnswers([...acceptableAnswers, ''])}
                                stretched
                            >
                                {t('addAnswer')}
                            </Button>
                            <FormItem style={{ marginTop: 16 }}>
                                <Checkbox
                                    checked={caseSensitive}
                                    onChange={(e) => setCaseSensitive(e.target.checked)}
                                >
                                    {t('caseSensitive')}
                                </Checkbox>
                            </FormItem>
                        </>
                    )}

                    {questionType === 'Numeric' && (
                        <>
                            <FormItem top={t('correctNumericAnswer')} htmlFor="numericAnswer">
                                <Input
                                    id="numericAnswer"
                                    type="number"
                                    value={numericAnswer}
                                    onChange={(e) => setNumericAnswer(e.target.value)}
                                    placeholder={t('numericAnswerPlaceholder')}
                                />
                            </FormItem>
                            <FormItem>
                                <Checkbox
                                    checked={allowDecimal}
                                    onChange={(e) => setAllowDecimal(e.target.checked)}
                                >
                                    {t('allowDecimal')}
                                </Checkbox>
                            </FormItem>
                            <FormItem top={t('tolerance')} htmlFor="tolerance">
                                <Input
                                    id="tolerance"
                                    type="number"
                                    value={tolerance}
                                    onChange={(e) => setTolerance(e.target.value)}
                                    placeholder={t('tolerancePlaceholder')}
                                    step="0.01"
                                />
                            </FormItem>
                        </>
                    )}

                    {questionType === 'Matching' && (
                        <>
                            <Header>
                                {t('matchingTitle')}
                            </Header>
                            <Caption style={{ padding: '0 16px 8px', color: 'var(--vkui--color_text_secondary)' }}>
                                {t('matchingSubtitle')}
                            </Caption>
                            <div className="matchingCreator">
                                <div className="matchingColumn">
                                    <div className="matchingColumnTitle" style={{ paddingLeft: 16 }}>{t('leftItems')}</div>
                                    {leftItems.map((item, index) => (
                                        <div key={item.id} className="matchingPairRow" style={{ margin: '0 16px 8px' }}>
                                            <FormItem style={{ flex: 1, padding: 0 }}>
                                                <Input
                                                    value={item.text}
                                                    onChange={(e) => {
                                                        const newItems = [...leftItems];
                                                        newItems[index] = { ...item, text: e.target.value };
                                                        setLeftItems(newItems);
                                                    }}
                                                    placeholder={`${t('leftItem')} ${index + 1}`}
                                                />
                                            </FormItem>
                                            <IconButton
                                                onClick={() => {
                                                    if (leftItems.length <= 2) return;
                                                    setLeftItems(leftItems.filter((_, i) => i !== index));
                                                }}
                                                disabled={leftItems.length <= 2}
                                                aria-label={t('removeOption')}
                                            >
                                                <Icon24Delete />
                                            </IconButton>
                                        </div>
                                    ))}
                                    <div style={{ padding: '0 16px' }}>
                                        <Button
                                            mode="secondary"
                                            before={<Icon24Add />}
                                            onClick={() => setLeftItems([...leftItems, { id: `left-${Date.now()}`, text: '', imageUrl: null }])}
                                            stretched
                                            size="s"
                                        >
                                            {t('addLeftItem')}
                                        </Button>
                                    </div>
                                </div>
                                <div className="matchingColumn" style={{ marginTop: 16 }}>
                                    <div className="matchingColumnTitle" style={{ paddingLeft: 16 }}>{t('rightItems')}</div>
                                    {rightItems.map((item, index) => (
                                        <div key={item.id} className="matchingPairRow" style={{ margin: '0 16px 8px' }}>
                                            <FormItem style={{ flex: 1, padding: 0 }}>
                                                <Input
                                                    value={item.text}
                                                    onChange={(e) => {
                                                        const newItems = [...rightItems];
                                                        newItems[index] = { ...item, text: e.target.value };
                                                        setRightItems(newItems);
                                                    }}
                                                    placeholder={`${t('rightItem')} ${index + 1}`}
                                                />
                                            </FormItem>
                                            <IconButton
                                                onClick={() => {
                                                    if (rightItems.length <= 2) return;
                                                    setRightItems(rightItems.filter((_, i) => i !== index));
                                                }}
                                                disabled={rightItems.length <= 2}
                                                aria-label={t('removeOption')}
                                            >
                                                <Icon24Delete />
                                            </IconButton>
                                        </div>
                                    ))}
                                    <div style={{ padding: '0 16px' }}>
                                        <Button
                                            mode="secondary"
                                            before={<Icon24Add />}
                                            onClick={() => setRightItems([...rightItems, { id: `right-${Date.now()}`, text: '', imageUrl: null }])}
                                            stretched
                                            size="s"
                                        >
                                            {t('addRightItem')}
                                        </Button>
                                    </div>
                                </div>
                                <Header style={{ marginTop: 16 }}>{t('matchPairs')}</Header>
                                {leftItems.map((leftItem, leftIndex) => (
                                    <div key={leftItem.id} className="matchingPairRow" style={{ margin: '0 16px 8px', alignItems: 'center' }}>
                                        <Caption style={{ flex: 1 }}>{leftItem.text || `${t('leftItem')} ${leftIndex + 1}`}</Caption>
                                        <span style={{ color: 'var(--vkui--color_text_tertiary)' }}>→</span>
                                        <Select
                                            style={{ flex: 1 }}
                                            value={correctMatches[String(leftIndex)] !== undefined ? String(correctMatches[String(leftIndex)]) : ''}
                                            onChange={(e) => {
                                                setCorrectMatches({ ...correctMatches, [String(leftIndex)]: parseInt(e.target.value, 10) });
                                            }}
                                            options={[
                                                { value: '', label: t('selectMatch') },
                                                ...rightItems.map((ri, ri_idx) => ({ value: String(ri_idx), label: ri.text || `${t('rightItem')} ${ri_idx + 1}` })),
                                            ]}
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {questionType === 'Ordering' && (
                        <>
                            <Header>
                                {t('orderingTitle')}
                            </Header>
                            <Caption style={{ padding: '0 16px 8px', color: 'var(--vkui--color_text_secondary)' }}>
                                {t('orderingSubtitle')}
                            </Caption>
                            <div className="orderingCreator" style={{ padding: '0 16px' }}>
                                {orderingItems.map((item, index) => (
                                    <div key={item.id} className="orderingCreatorItem">
                                        <div className="orderingCreatorIndex">{index + 1}</div>
                                        <FormItem style={{ flex: 1, padding: 0 }}>
                                            <Input
                                                value={item.text}
                                                onChange={(e) => {
                                                    const newItems = [...orderingItems];
                                                    newItems[index] = { ...item, text: e.target.value };
                                                    setOrderingItems(newItems);
                                                }}
                                                placeholder={`${t('orderItem')} ${index + 1}`}
                                            />
                                        </FormItem>
                                        <IconButton
                                            onClick={() => {
                                                if (orderingItems.length <= 2) return;
                                                setOrderingItems(orderingItems.filter((_, i) => i !== index));
                                            }}
                                            disabled={orderingItems.length <= 2}
                                            aria-label={t('removeOption')}
                                        >
                                            <Icon24Delete />
                                        </IconButton>
                                    </div>
                                ))}
                                <Button
                                    mode="secondary"
                                    before={<Icon24Add />}
                                    onClick={() => setOrderingItems([...orderingItems, { id: `ord-${Date.now()}`, text: '', imageUrl: null }])}
                                    stretched
                                    style={{ marginTop: 8 }}
                                >
                                    {t('addOrderItem')}
                                </Button>
                            </div>
                            <Caption style={{ padding: '8px 16px', color: 'var(--vkui--color_text_secondary)' }}>
                                {t('orderingHint')}
                            </Caption>
                        </>
                    )}

                    {questionType === 'FillInTheBlank' && (() => {
                        const blankKeyPattern = /\{\{(\w+)\}\}/g;
                        const foundKeys: string[] = [];
                        let m;
                        while ((m = blankKeyPattern.exec(questionText)) !== null) {
                            foundKeys.push(m[1]);
                        }
                        return (
                            <>
                                <Header>
                                    {t('fillBlankTitle')}
                                </Header>
                                <Caption style={{ padding: '0 16px 8px', color: 'var(--vkui--color_text_secondary)' }}>
                                    {t('fillBlankSubtitle')}
                                </Caption>
                                <Caption style={{ padding: '0 16px 8px', color: 'var(--vkui--color_text_secondary)' }}>
                                    {t('fillBlankInstruction')}
                                </Caption>
                                {foundKeys.length === 0 && (
                                    <Caption style={{ padding: '8px 16px', color: 'var(--vkui--color_accent_orange)' }}>
                                        {t('fillBlankNoKeys')}
                                    </Caption>
                                )}
                                <div className="fillBlankCreator" style={{ padding: '0 16px' }}>
                                    {foundKeys.map((key) => (
                                        <div key={key} className="blankKeyGroup">
                                            <div className="blankKeyLabel">{'{{' + key + '}}'}</div>
                                            {(blankAnswers[key] || ['']).map((answer, aIdx) => (
                                                <div key={aIdx} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                                                    <Input
                                                        style={{ flex: 1 }}
                                                        value={answer}
                                                        onChange={(e) => {
                                                            const newAnswers = { ...blankAnswers };
                                                            const arr = [...(newAnswers[key] || [''])];
                                                            arr[aIdx] = e.target.value;
                                                            newAnswers[key] = arr;
                                                            setBlankAnswers(newAnswers);
                                                        }}
                                                        placeholder={t('blankAnswerPlaceholder')}
                                                    />
                                                    {(blankAnswers[key]?.length || 1) > 1 && (
                                                        <IconButton
                                                            onClick={() => {
                                                                const newAnswers = { ...blankAnswers };
                                                                newAnswers[key] = (newAnswers[key] || ['']).filter((_, i) => i !== aIdx);
                                                                setBlankAnswers(newAnswers);
                                                            }}
                                                        >
                                                            <Icon24Delete />
                                                        </IconButton>
                                                    )}
                                                </div>
                                            ))}
                                            <Button
                                                mode="tertiary"
                                                size="s"
                                                before={<Icon24Add />}
                                                onClick={() => {
                                                    const newAnswers = { ...blankAnswers };
                                                    newAnswers[key] = [...(newAnswers[key] || ['']), ''];
                                                    setBlankAnswers(newAnswers);
                                                }}
                                            >
                                                {t('addBlankAnswer')}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        );
                    })()}

                    <FormItem top={t('hint')} htmlFor="hint">
                        <Textarea
                            id="hint"
                            value={hint}
                            onChange={(e) => setHint(e.target.value)}
                            rows={2}
                            placeholder={t('hintPlaceholder')}
                        />
                    </FormItem>

                    <FormItem top={t('explanation')} htmlFor="explanation">
                        <Textarea
                            id="explanation"
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            rows={3}
                            placeholder={t('explanationPlaceholder')}
                        />
                    </FormItem>
                </Group>

                <div style={{ padding: '16px', display: 'flex', gap: 8 }}>
                    <Button
                        size="l"
                        stretched
                        type="submit"
                        loading={createQuestion.isPending}
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
