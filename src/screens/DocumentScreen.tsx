import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getClientProfile, getClientStatements } from '../api/user.service';
import { useAuthStore } from '../store/authStore';

interface Document {
    doc_name: string;
    doc_file: string;
}

interface Statement {
    year_month: string;
    file_url: string;
}

// interface DocumentScreenParams {
//     clientId: number;
//     clientName?: string;
// }

const DocumentScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    // const params = route.params as DocumentScreenParams;
    const { user } = useAuthStore();

    const [activeTab, setActiveTab] = useState<'Documents' | 'Statements'>('Documents');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [statements, setStatements] = useState<Statement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchDocuments(), fetchStatements()]);
            setLoading(false);
        };

        loadData();
    }, [user?.id]);

    const fetchDocuments = async () => {
        try {
            const response = await getClientProfile(user?.id);
            if (response.data?.client_documents) {
                setDocuments(response.data.client_documents);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const fetchStatements = async () => {
        try {
            const response = await getClientStatements(user?.id);
            if (response.data) {
                setStatements(response.data);
            }
        } catch (error) {
            console.error('Error fetching statements:', error);
        }
    };

    const openFile = (file: string) => {
        const url = `${process.env.EXPO_PUBLIC_BASE_URL}${file}`;
        Linking.openURL(url).catch(err => console.error("Couldn't open file", err));
    };

    const renderHeader = () => (
        <View style={styles.header}>
            {/* <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity> */}
            <Text style={[styles.headerTitle, { color: theme.text }]}>
                {user ? `${user.client_name}'s Documents` : 'Client Documents'}
            </Text>
        </View>
    );

    const renderTabs = () => (
        <View style={[styles.tabContainer, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'Documents' && { borderBottomColor: theme.primary }]}
                onPress={() => setActiveTab('Documents')}
            >
                <Text style={[
                    styles.tabText,
                    { color: activeTab === 'Documents' ? theme.primary : theme.textTertiary }
                ]}>
                    Documents
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tab, activeTab === 'Statements' && { borderBottomColor: theme.primary }]}
                onPress={() => setActiveTab('Statements')}
            >
                <Text style={[
                    styles.tabText,
                    { color: activeTab === 'Statements' ? theme.primary : theme.textTertiary }
                ]}>
                    Statements
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderDocumentItem = ({ item }: { item: Document }) => (
        <TouchableOpacity
            style={[styles.docItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => openFile(item.doc_file)}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="document-text" size={24} color="#D32F2F" />
            </View>

            <View style={styles.docInfo}>
                <Text style={[styles.docName, { color: theme.text }]}>{item.doc_name}</Text>
                <Text style={[styles.docSubtitle, { color: theme.textTertiary }]}>Tap to view PDF</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>
    );

    const renderStatementItem = ({ item }: { item: Statement }) => (
        <TouchableOpacity
            style={[styles.docItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => openFile(item.file_url)}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#1976D2" />
            </View>

            <View style={styles.docInfo}>
                <Text style={[styles.docName, { color: theme.text }]}>
                    {item.year_month} Statement
                </Text>
                <Text style={[styles.docSubtitle, { color: theme.textTertiary }]}>Tap to view PDF</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            );
        }

        if (activeTab === 'Documents') {
            if (documents.length === 0) {
                return (
                    <View style={styles.centerContent}>
                        <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
                            No documents found.
                        </Text>
                    </View>
                );
            }

            return (
                <FlatList<Document>
                    data={documents}
                    renderItem={renderDocumentItem}
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            );
        }

        // Statements tab
        if (statements.length === 0) {
            return (
                <View style={styles.centerContent}>
                    <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
                        No statements found.
                    </Text>
                </View>
            );
        }

        return (
            <FlatList<Statement>
                data={statements}
                renderItem={renderStatementItem}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        );
    };

    return (
        <LinearGradient
            colors={theme.backgroundGradient as [string, string, ...string[]]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                {renderHeader()}
                {renderTabs()}
                {renderContent()}
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
    backButton: { padding: 5, marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    tabContainer: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 10 },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 15, borderBottomWidth: 2 },
    tabText: { fontSize: 16, fontWeight: '600' },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20 },
    docItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    docInfo: { flex: 1 },
    docName: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
    docSubtitle: { fontSize: 12 },
    emptyText: { fontSize: 16 },
});

export default DocumentScreen;
