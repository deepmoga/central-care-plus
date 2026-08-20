import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import { getReviewQuestions, submitReview, getReviewAnswers } from '../api/jobs.service';

const EMOJIS = [
    { name: 'sad-outline', color: '#EF4444', value: 1, label: 'Very Bad' },
    { name: 'sad', color: '#F97316', value: 2, label: 'Bad' },
    { name: 'happy-outline', color: '#EAB308', value: 3, label: 'Okay' },
    { name: 'happy', color: '#84CC16', value: 4, label: 'Good' },
    { name: 'heart-outline', color: '#22C55E', value: 5, label: 'Great' },
];

interface Question {
    id: number;
    title: string;
    type: 'multiple_choice' | 'emoji_rating' | 'text_input';
    options?: string[];
}

export default function RatingScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { jobId, carerId, clientId, jobTable } = route.params as any;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<{ [key: number]: string | number }>({});
    const [submitting, setSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const answersResponse = await getReviewAnswers(jobId, carerId, clientId, jobTable);
            
            if (answersResponse?.success && answersResponse?.already_submitted) {
                setIsSubmitted(true);
                const mappedQuestions = answersResponse.data.map((item: any) => ({
                    id: item.question_id,
                    title: item.question_title,
                    type: item.question_type,
                    options: item.options
                }));
                const mappedAnswers: { [key: number]: string | number } = {};
                answersResponse.data.forEach((item: any) => {
                    mappedAnswers[item.question_id] = item.question_type === 'emoji_rating' ? Number(item.answer) : item.answer;
                });
                setQuestions(mappedQuestions);
                setAnswers(mappedAnswers);
                setLoading(false);
                return;
            }

            const response = await getReviewQuestions();
            if (response?.success && response?.data) {
                setQuestions(response.data);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load rating questions.',
                });
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An error occurred while loading questions.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnswer = (questionId: number, value: string | number) => {
        if (isSubmitted) return;
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleSubmit = async () => {
        // Check if all required questions (non-text input) are answered
        // Text inputs might be optional, but if the user wants all required:
        const allAnswered = questions.every(q => {
            if (q.type === 'text_input') return true; // text inputs are often optional
            return answers[q.id] !== undefined;
        });

        if (!allAnswered) {
            Toast.show({
                type: 'error',
                text1: 'Incomplete',
                text2: 'Please answer all multiple-choice and rating questions.',
            });
            return;
        }

        setSubmitting(true);
        try {
            const formattedAnswers = Object.keys(answers).map(qId => ({
                question_id: parseInt(qId),
                answer: answers[parseInt(qId)].toString()
            }));

            const payload = {
                job_id: Number(jobId),
                carer_id: Number(carerId),
                client_id: Number(clientId),
                table_name: jobTable,
                answers: formattedAnswers
            };

            console.log('Submit Review Payload:', JSON.stringify(payload, null, 2));

            const response = await submitReview(payload);
            
            // If the service returns an Axios error object, it might have response.data
            const errorData = response?.response?.data;
            const isSuccess = response?.success === true;

            if (isSuccess) {
                Toast.show({
                    type: 'success',
                    text1: 'Thank You!',
                    text2: 'Your rating has been submitted successfully.',
                });
                navigation.goBack();
            } else {
                console.log('Submit Review Error Response:', errorData || response);
                
                let errorMsg = 'Failed to submit rating.';
                if (typeof errorData === 'string') {
                    // Truncate if it's a huge HTML error page
                    errorMsg = errorData.substring(0, 100);
                } else if (errorData?.message) {
                    errorMsg = errorData.message;
                } else if (errorData?.error) {
                    errorMsg = errorData.error;
                } else if (response?.message) {
                    errorMsg = response.message;
                }

                Toast.show({
                    type: 'error',
                    text1: 'Server Error',
                    text2: errorMsg,
                });
            }
        } catch (error: any) {
            console.error('Error submitting rating:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.message || 'An error occurred while submitting.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Rate Service</Text>
                {isSubmitted ? (
                    <View style={{ backgroundColor: theme.success + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="checkmark-circle" size={12} color={theme.success} style={{ marginRight: 4 }} />
                        <Text style={{ color: theme.success, fontWeight: '700', fontSize: 10, textTransform: 'uppercase' }}>Submitted</Text>
                    </View>
                ) : (
                    <View style={{ width: 24 }} />
                )}
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <>
                    <KeyboardAwareScrollView
                        contentContainerStyle={styles.scrollContent}
                        enableOnAndroid={true}
                        keyboardShouldPersistTaps="handled"
                        extraScrollHeight={20}
                    >
                        <View style={styles.introContainer}>
                            <Text style={[styles.introText, { color: theme.textSecondary }]}>
                                Please take a moment to rate the service you received. Your feedback helps us improve!
                            </Text>
                        </View>

                        {questions.map((q, index) => (
                            <View key={q.id} style={[styles.questionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Text style={[styles.questionTitle, { color: theme.text, marginBottom: q.type === 'multiple_choice' ? 12 : 16 }]}>
                                    {index + 1}. {q.title}
                                </Text>

                                {q.type === 'multiple_choice' && q.options && q.options.map((option) => {
                                    const isSelected = answers[q.id] === option;
                                    return (
                                        <TouchableOpacity
                                            key={option}
                                            style={[styles.optionRow, { borderColor: isSelected ? theme.primary : theme.border, backgroundColor: isSelected ? `${theme.primary}10` : 'transparent' }]}
                                            onPress={() => handleSelectAnswer(q.id, option)}
                                        >
                                            <View style={[styles.radioCircle, { borderColor: isSelected ? theme.primary : theme.textTertiary }]}>
                                                {isSelected && <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />}
                                            </View>
                                            <Text style={[styles.optionText, { color: isSelected ? theme.primary : theme.text }]}>{option}</Text>
                                        </TouchableOpacity>
                                    );
                                })}

                                {q.type === 'emoji_rating' && (
                                    <View style={styles.emojiRow}>
                                        {EMOJIS.map((emoji) => {
                                            const isSelected = answers[q.id] === emoji.value;
                                            return (
                                                <TouchableOpacity
                                                    key={emoji.value}
                                                    style={[styles.emojiBtn, { alignItems: 'center' }, isSelected && { transform: [{ scale: 1.1 }] }]}
                                                    onPress={() => handleSelectAnswer(q.id, emoji.value)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Ionicons
                                                        name={emoji.name as any}
                                                        size={40}
                                                        color={isSelected ? emoji.color : theme.textTertiary}
                                                    />
                                                    <Text style={{ color: isSelected ? emoji.color : theme.textTertiary, fontSize: 10, marginTop: 4, fontWeight: isSelected ? 'bold' : 'normal' }}>
                                                        {emoji.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}

                                {q.type === 'text_input' && (
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }
                                        ]}
                                        placeholder="Add your comments here..."
                                        placeholderTextColor={theme.textTertiary}
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                        value={(answers[q.id] as string) || ''}
                                        onChangeText={(text) => handleSelectAnswer(q.id, text)}
                                        editable={!isSubmitted}
                                    />
                                )}
                            </View>
                        ))}
                        {!isSubmitted && (
                            <View style={{ marginTop: 8 }}>
                                <TouchableOpacity
                                    style={[styles.submitButton, { backgroundColor: theme.primary }, submitting && { opacity: 0.7 }]}
                                    onPress={handleSubmit}
                                    disabled={submitting || questions.length === 0}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Submit Rating</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </KeyboardAwareScrollView>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scrollContent: { padding: 16, paddingBottom: 60 },
    introContainer: { marginBottom: 20 },
    introText: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
    questionCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    questionTitle: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 22,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    emojiRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    emojiBtn: {
        padding: 4,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        minHeight: 100,
        fontSize: 14,
    },
    footer: { padding: 16, borderTopWidth: 1 },
    submitButton: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
