import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getJobNotes, addJobNote } from '../api/jobs.service';
import Toast from 'react-native-toast-message';
import * as SystemUI from 'expo-system-ui';
import { useAuthStore } from '../store/authStore';

const JobNotesScreen = () => {
    const { theme, isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { role } = useAuthStore();

    const { table_name, service_id, client_id, carer_id } = route.params as any;

    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        SystemUI.setBackgroundColorAsync(isDark ? '#000000' : '#ffffff');
    }, [isDark]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const response = await getJobNotes(service_id, table_name);
            if (response.success && Array.isArray(response.data)) {
                setNotes(response.data);
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 150);
            }
        } catch {
            Toast.show({ type: 'error', text1: 'Error loading notes' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [service_id, table_name]);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setSubmitting(true);
        try {
            const response = await addJobNote({
                table_name,
                service_id,
                client_id,
                carer_id,
                service_note: newNote,
                role: role,
            });

            if (response.success) {
                setNewNote('');
                fetchNotes();
                Toast.show({ type: 'success', text1: 'Note added successfully' });
            }
        } catch {
            Alert.alert('Error', 'Failed to add note');
        } finally {
            setSubmitting(false);
        }
    };

    const renderNoteItem = ({ item }: { item: any }) => (
        <View
            style={{
                backgroundColor: theme.surface,
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.border,
            }}
        >
            <Text style={{ color: theme.text, fontSize: 16, marginBottom: 8 }}>
                {item.service_note}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.textTertiary, fontSize: 12 }}>
                    {new Date(item.created_at).toLocaleString()}
                </Text>

                {(item.user_name || item.client_name) && (
                    <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '500' }}>
                        {item.role === 'carer' ? item.user_name : item.client_name}
                    </Text>
                )}
            </View>
        </View>
    );

    return (
        <LinearGradient colors={theme.backgroundGradient as any} style={{ flex: 1 }}>
            <View style={{ flex: 1, paddingTop: insets.top }}>

                {/* HEADER (fixed) */}
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>

                    <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold', marginLeft: 16 }}>
                        Job Notes
                    </Text>
                </View>

                {/* LIST (scrolls — height auto shrinks when keyboard opens) */}
                <View style={{ flex: 1, paddingHorizontal: 16 }}>
                    {loading ? (
                        <ActivityIndicator size="large" color={theme.primary} />
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={notes}
                            renderItem={renderNoteItem}
                            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ paddingBottom: 12 }}
                            ListEmptyComponent={
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                                    <Text style={{ color: theme.textTertiary, fontSize: 16 }}>No Job Notes Yet</Text>
                                </View>
                            }
                        />
                    )}
                </View>

                {/* INPUT BAR — ONLY THIS AVOIDS KEYBOARD */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                // keyboardVerticalOffset={0}
                >
                    <View
                        style={{
                            paddingHorizontal: 16,
                            paddingTop: 10,
                            paddingBottom: insets.bottom || 10,
                            backgroundColor: theme.surface,
                            borderTopWidth: 1,
                            borderTopColor: theme.border,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <TextInput
                            style={{
                                flex: 1,
                                backgroundColor: theme.background,
                                color: theme.text,
                                borderRadius: 20,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                marginRight: 12,
                                borderWidth: 1,
                                borderColor: theme.border,
                                maxHeight: 120,
                            }}
                            placeholder="Add a note..."
                            placeholderTextColor={theme.textTertiary}
                            multiline
                            value={newNote}
                            onChangeText={setNewNote}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            onPress={handleAddNote}
                            disabled={submitting || !newNote.trim()}
                            style={{
                                backgroundColor: theme.primary,
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                justifyContent: 'center',
                                alignItems: 'center',
                                opacity: submitting || !newNote.trim() ? 0.6 : 1,
                            }}
                        >
                            {submitting
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Ionicons name="send" size={20} color="#fff" />}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </LinearGradient>
    );
};

export default JobNotesScreen;
