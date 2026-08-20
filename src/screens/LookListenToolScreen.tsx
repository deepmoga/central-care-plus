import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { getCuresAlerts, saveServiceCuresAlerts, getServiceCuresAlerts } from '../api/jobs.service';
import Toast from 'react-native-toast-message';

export default function LookListenToolScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { clientName, serviceId, tableName, carerId, clientId, clientAddress, signLastDate } = route.params as any;

    let isExpired = false;
    if (signLastDate) {
        const signLastDateObj = new Date(signLastDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        signLastDateObj.setHours(0, 0, 0, 0);
        isExpired = now > signLastDateObj;
    }

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [hasSubmittedData, setHasSubmittedData] = useState(false);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        const [alertsResponse, previousDataResponse] = await Promise.all([
            getCuresAlerts(),
            getServiceCuresAlerts(serviceId, tableName)
        ]);

        if (alertsResponse?.success) {
            setAlerts(alertsResponse.data);
        } else {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to fetch alerts.',
            });
        }

        if (previousDataResponse?.success && previousDataResponse.data && previousDataResponse.data.length > 0) {
            setHasSubmittedData(true);
            setSelectedItems(previousDataResponse.data.map((item: any) => ({
                id: item.id,
                title: item.title,
                additional_info: item.additional_info
            })));
            setAdditionalInfo(previousDataResponse.data[0]?.additional_info || '');
        }
        
        setLoading(false);
    };

    const toggleItem = (item: any) => {
        if (isExpired) return;
        
        const index = selectedItems.findIndex((i) => i.id === item.id);
        if (index > -1) {
            setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
        } else {
            setSelectedItems([...selectedItems, { id: item.id, title: item.title }]);
        }
    };

    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            Toast.show({
                type: 'info',
                text1: 'No Selection',
                text2: 'Please select at least one item.',
            });
            return;
        }

        setSubmitting(true);
        const payload = {
            service_id: serviceId,
            table_name: tableName,
            carer_id: carerId,
            client_id: clientId,
            items: selectedItems,
            additional_info: additionalInfo
        };

        const response = await saveServiceCuresAlerts(payload);
        if (response?.success) {
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Saved successfully.',
            });
            navigation.goBack();
        } else {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to save data.',
            });
        }
        setSubmitting(false);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={[{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Look and Listen Tool</Text>
                    <View style={{ width: 24 }} />
                </View>
                <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 18, textAlign: 'left', marginTop: 12 }}>
                    If you have identified a change while caring for or observing a client, please tick the change, add any additional information where indicated.
                </Text>
            </View>

            <View style={styles.clientInfoContainer}>
                <Text style={[styles.clientName, { color: theme.text }]}>Client: {clientName}</Text>
                {clientAddress && (
                    <Text style={[styles.clientAddress, { color: theme.textSecondary }]}>
                       {/* also show address icon before address add margin-right to icon */}
                        <Ionicons name="location" size={16} color={theme.textSecondary} style={{ marginRight: 10 }} />
                        {clientAddress}
                    </Text>
                )}
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <KeyboardAwareScrollView 
                    contentContainerStyle={styles.scrollContent}
                    enableOnAndroid={true}
                    keyboardShouldPersistTaps="handled"
                    extraScrollHeight={20}
                >
                    {alerts.map((item) => {
                        const isSelected = selectedItems.some((i) => i.id === item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.itemContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={() => toggleItem(item)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={isSelected ? 'checkbox' : 'square-outline'}
                                    size={24}
                                    color={isSelected ? theme.primary : theme.textSecondary}
                                />
                                <View style={styles.itemTextContainer}>
                                    <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
                                    <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>{item.short_desc}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                    
                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>Additional Info</Text>
                        <TextInput
                            style={[styles.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: isExpired ? theme.border : theme.surface }]}
                            placeholder="Enter any additional information..."
                            placeholderTextColor={theme.textTertiary}
                            multiline
                            numberOfLines={4}
                            value={additionalInfo}
                            onChangeText={setAdditionalInfo}
                            textAlignVertical="top"
                            editable={!isExpired}
                        />
                    </View>

                    {!isExpired && (
                        <View style={{ marginTop: 8 }}>
                            <TouchableOpacity
                                style={[styles.submitButton, { backgroundColor: theme.primary }, submitting && { opacity: 0.7 }]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </KeyboardAwareScrollView>
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
    clientInfoContainer: { padding: 16, paddingBottom: 8 },
    clientName: { fontSize: 16, fontWeight: '600' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 16, paddingBottom: 60 },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    itemTextContainer: { marginLeft: 12, flex: 1 },
    itemTitle: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
    itemDesc: { fontSize: 14 },
    footer: { padding: 16, borderTopWidth: 1 },
    submitButton: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    clientAddress: { fontSize: 14, marginTop: 4 },
    inputContainer: { marginTop: 16, marginBottom: 24 },
    inputLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8 },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        minHeight: 100,
    },
});
