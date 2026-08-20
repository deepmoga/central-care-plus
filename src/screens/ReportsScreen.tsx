import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Linking, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyles } from '../styles/ReportStyles';
import { useTheme } from '../context/ThemeContext';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getServiceReport, getTimesheets, getCarerCuresAlerts } from '../api/reports.service';
import WeekCalendar from '../components/WeekCalendar';
import { useAuthStore } from '../store/authStore';

interface ReportStats {
    total_hours: number;
    total_hours_claimed: number;
    total_private_kms: number;
    total_outing_kms: number;
    total_services: number;
    total_completed: number;
    total_pending: number;
    total_emergency_logs: number;
}

interface Timesheet {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    file_name: string;
    file_url: string;
    display_in_app: number;
    created_at: string;
    created_by: number;
    created_by_name: string;
}

const ReportsScreen = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const navigation = useNavigation();
    const { user } = useAuthStore();

    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<ReportStats>({
        total_hours: 0,
        total_hours_claimed: 0,
        total_private_kms: 0,
        total_outing_kms: 0,
        total_services: 0,
        total_completed: 0,
        total_pending: 0,
        total_emergency_logs: 0,
    });
    const [serviceStatus, setServiceStatus] = useState<any[]>([]);

    const [activeTab, setActiveTab] = useState<'Reports' | 'Timesheet' | 'Look & Listen'>('Reports');
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [loadingTimesheets, setLoadingTimesheets] = useState(false);
    const [lookListenData, setLookListenData] = useState<any[]>([]);
    const [loadingLookListen, setLoadingLookListen] = useState(false);

    /**
     * ---------- WEEK START = MONDAY ----------
     */
    useEffect(() => {
        const today = new Date();
        const day = today.getDay(); // 0 = Sun → 6 = Sat
        const monday = new Date(today);

        // distance back to Monday
        const diff = day === 0 ? 6 : day - 1;

        monday.setDate(today.getDate() - diff);
        setCurrentWeekStart(monday);
    }, []);

    const handleWeekChange = (direction: 'prev' | 'next') => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(
            currentWeekStart.getDate() + (direction === 'next' ? 7 : -7)
        );
        setCurrentWeekStart(newStart);
        setSelectedDate(null); // Reset selection on week change
    };

    const normalizeLocalDate = (value: Date) => {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const handleDayPress = (date: Date) => {
        const dateStr = normalizeLocalDate(date);
        if (selectedDate === dateStr) {
            setSelectedDate(null); // Deselect
        } else {
            setSelectedDate(dateStr);
        }
    };

    const fetchReports = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            let startDate = '';
            let endDate = '';

            if (selectedDate) {
                startDate = selectedDate;
                endDate = selectedDate;
            } else {
                const formatDate = (date: Date) => {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const d = String(date.getDate()).padStart(2, '0');
                    return `${y}-${m}-${d}`;
                };

                startDate = formatDate(currentWeekStart);
                const end = new Date(currentWeekStart);
                end.setDate(currentWeekStart.getDate() + 6);
                endDate = formatDate(end);
            }

            const data = await getServiceReport(user.id.toString(), startDate, endDate);
            if (data && data.success) {
                setStats(data);
                const status = Object.values(data.status);
                setServiceStatus(status)
            } else {
                // Reset stats if failed or empty
                setStats({
                    total_hours: 0,
                    total_hours_claimed: 0,
                    total_private_kms: 0,
                    total_outing_kms: 0,
                    total_services: 0,
                    total_completed: 0,
                    total_pending: 0,
                    total_emergency_logs: 0,
                });
                setServiceStatus([]);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (activeTab === 'Reports') {
            await fetchReports();
        } else if (activeTab === 'Timesheet') {
            await fetchTimesheetsData();
        } else {
            await fetchLookListenData();
        }
        setRefreshing(false);
    }, [activeTab, currentWeekStart, selectedDate]);

    const fetchLookListenData = async () => {
        if (!user?.id) return;
        setLoadingLookListen(true);
        try {
            const res = await getCarerCuresAlerts(user.id.toString());
            if (res && res.success && res.data) {
                setLookListenData(res.data);
            } else {
                setLookListenData([]);
            }
        } catch (error) {
            console.error('Error fetching look and listen data:', error);
            setLookListenData([]);
        } finally {
            setLoadingLookListen(false);
        }
    };

    const fetchTimesheetsData = async () => {
        if (!user?.id) return;
        setLoadingTimesheets(true);
        try {
            const res = await getTimesheets(user.id.toString());
            if (res && res.success && res.data) {
                setTimesheets(res.data);
            } else {
                setTimesheets([]);
            }
        } catch (error) {
            console.error('Error fetching timesheets:', error);
            setTimesheets([]);
        } finally {
            setLoadingTimesheets(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchReports();
            fetchTimesheetsData();
            fetchLookListenData();
        }, [currentWeekStart, selectedDate])
    );

    const openFile = (file: string) => {
        const url = `${process.env.EXPO_PUBLIC_BASE_URL}${file}`;
        Linking.openURL(url).catch(err => console.error("Couldn't open file", err));
    };

    const renderTabs = () => (
        <View style={[{ borderBottomColor: theme.border, flexDirection: 'row', borderBottomWidth: 1, marginBottom: 10, marginHorizontal: 20 }]}>
            <TouchableOpacity
                style={[{ flex: 1, alignItems: 'center', paddingVertical: 15, borderBottomWidth: 2 }, activeTab === 'Reports' ? { borderBottomColor: theme.primary } : { borderBottomColor: 'transparent' }]}
                onPress={() => setActiveTab('Reports')}
            >
                <Text style={[
                    { fontSize: 16, fontWeight: '600' },
                    { color: activeTab === 'Reports' ? theme.primary : theme.textTertiary }
                ]}>
                    Reports
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[{ flex: 1, alignItems: 'center', paddingVertical: 15, borderBottomWidth: 2 }, activeTab === 'Timesheet' ? { borderBottomColor: theme.primary } : { borderBottomColor: 'transparent' }]}
                onPress={() => setActiveTab('Timesheet')}
            >
                <Text style={[
                    { fontSize: 16, fontWeight: '600' },
                    { color: activeTab === 'Timesheet' ? theme.primary : theme.textTertiary }
                ]}>
                    Timesheet
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[{ flex: 1, alignItems: 'center', paddingVertical: 15, borderBottomWidth: 2 }, activeTab === 'Look & Listen' ? { borderBottomColor: theme.primary } : { borderBottomColor: 'transparent' }]}
                onPress={() => setActiveTab('Look & Listen')}
            >
                <Text style={[
                    { fontSize: 16, fontWeight: '600', textAlign: 'center' },
                    { color: activeTab === 'Look & Listen' ? theme.primary : theme.textTertiary }
                ]}>
                    Look & Listen
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderLookListenItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[{ backgroundColor: theme.surface, borderColor: theme.border, flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, elevation: 2 }]}
            onPress={() => (navigation as any).navigate('LookListenTool', {
                serviceId: item.service_id,
                tableName: item.table_name,
                clientName: `${item.client_name} ${item.family_name}`,
                carerId: user?.id,
                clientId: item.items && item.items.length > 0 ? item.items[0].client_id : null,
                clientAddress: ''
            })}
        >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                <Ionicons name="eye" size={24} color={theme.primary} />
            </View>

            <View style={{ flex: 1 }}>
                <Text style={[{ color: theme.text, fontSize: 16, fontWeight: '500', marginBottom: 4 }]}>
                    {item.service_name}
                </Text>
                <Text style={[{ color: theme.textSecondary, fontSize: 14, marginBottom: 2 }]}>
                    {item.client_name} {item.family_name}
                </Text>
                <Text style={[{ color: theme.textTertiary, fontSize: 12 }]}>
                    {item.items && item.items.length > 0 ? item.items[0].created_at : ''}
                </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>
    );

    const renderTimesheetItem = ({ item }: { item: Timesheet }) => (
        <TouchableOpacity
            style={[{ backgroundColor: theme.surface, borderColor: theme.border, flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, elevation: 2 }]}
            onPress={() => openFile(item.file_url)}
        >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                <Ionicons name="document-text" size={24} color="#1976D2" />
            </View>

            <View style={{ flex: 1 }}>
                <Text style={[{ color: theme.text, fontSize: 16, fontWeight: '500', marginBottom: 4 }]}>
                    {item.title}
                </Text>
                <Text style={[{ color: theme.textTertiary, fontSize: 12 }]}>
                    {item.start_date} to {item.end_date}
                </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={theme.backgroundGradient as [string, string, ...string[]]} style={{ flex: 1 }}>
            <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Report</Text>

                    {renderTabs()}

                    {activeTab === 'Reports' && (
                        <WeekCalendar
                            currentWeekStart={currentWeekStart}
                            onWeekChange={handleWeekChange}
                            selectedDate={selectedDate}
                            onDayPress={handleDayPress}
                        />
                    )}
                </View>

                {activeTab === 'Reports' ? (
                    <ScrollView 
                        style={styles.scrollView} 
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
                        }
                    >
                    {loading ? (
                        <View style={{ padding: 20 }}>
                            <ActivityIndicator size="large" color={theme.primary} />
                        </View>
                    ) : (
                        /* Stats Cards */
                        <View style={styles.statsContainer}>
                            {/* Total Hours */}
                            <View style={styles.card}>
                                <View style={styles.cardRow}>
                                    <View style={styles.subStatContainer}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                            <FontAwesome5 name="clock" size={16} color={theme.textSecondary} style={{ marginRight: 8 }} />
                                            <Text style={styles.cardTitle}>Total Hours</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            {/* <Feather name="calendar" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} /> */}
                                            <Text style={styles.cardValue}>{stats.total_hours}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.subStatContainer}>
                                        <Text style={styles.subStatLabel}>Total Hours Claimed</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Text style={styles.subStatValue}>{stats.total_hours_claimed}</Text>
                                            {/* <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} /> */}
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Total Outing Kms */}
                            <View style={styles.card}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <FontAwesome5 name="car" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
                                        <Text style={[styles.cardTitle, { marginBottom: 0, fontSize: 14 }]}>Total Outing Kms</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.cardValue}>{stats.total_outing_kms}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Total Services */}
                            <View style={styles.card}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                        <Ionicons name="checkmark-circle" size={24} color={theme.textSecondary} style={{ marginRight: 8 }} />
                                        <Text style={[styles.cardTitle, { marginBottom: 0, fontSize: 14 }]}>Total Services</Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.cardValue, { marginBottom: 8 }]}>{stats.total_services}</Text>
                                    </View>
                                </View>

                                <View style={styles.serviceStatusContainer}>
                                    {Array.isArray(serviceStatus) && serviceStatus.map((item: any, index: number) => (
                                        <View key={index} style={[styles.statusPill, { backgroundColor: item.color }]}>
                                            <Ionicons name={item.icon || 'ellipse'} size={16} color="#fff" />
                                            <Text style={styles.statusText}>{item.status_title} - {item.count}</Text>
                                        </View>
                                    ))}
                                </View>
                                {/* /* <View style={[styles.statusPill, { backgroundColor: '#48BB78' }]}>
                                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                        <Text style={styles.statusText}>{stats.total_completed} Completed</Text>
                                </View>
                                    <View style={[styles.statusPill, { backgroundColor: '#ECC94B' }]}>
                                        <Feather name="clock" size={16} color="#fff" />
                                        <Text style={styles.statusText}>{stats.total_pending} Pending</Text>
                                    </View> */ }
                            </View>

                            {/* Total Emergency Logs */}
                            <View style={styles.emergencyCard}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                                        <Ionicons name="warning" size={24} color="#F56565" style={{ marginRight: 8 }} />

                                        <Text style={{ color: theme.text, fontWeight: '600', fontSize: 14, marginBottom: 4, }}>Total Emergency Logs</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.cardValue}>{stats.total_emergency_logs}</Text>
                                    </View>
                                </View>

                            </View>
                        </View>
                    )}
                    </ScrollView>
                ) : activeTab === 'Timesheet' ? (
                    loadingTimesheets ? (
                        <View style={{ padding: 20 }}>
                            <ActivityIndicator size="large" color={theme.primary} />
                        </View>
                    ) : timesheets.length === 0 ? (
                        <ScrollView 
                            contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
                            }
                        >
                            <Text style={{ color: theme.textTertiary, fontSize: 16 }}>No timesheets found.</Text>
                        </ScrollView>
                    ) : (
                        <FlatList<Timesheet>
                            data={timesheets}
                            renderItem={renderTimesheetItem}
                            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                            contentContainerStyle={{ padding: 20 }}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
                            }
                        />
                    )
                ) : (
                    loadingLookListen ? (
                        <View style={{ padding: 20 }}>
                            <ActivityIndicator size="large" color={theme.primary} />
                        </View>
                    ) : lookListenData.length === 0 ? (
                        <ScrollView 
                            contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
                            }
                        >
                            <Text style={{ color: theme.textTertiary, fontSize: 16 }}>No look and listen records found.</Text>
                        </ScrollView>
                    ) : (
                        <FlatList<any>
                            data={lookListenData}
                            renderItem={renderLookListenItem}
                            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                            contentContainerStyle={{ padding: 20 }}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
                            }
                        />
                    )
                )}
            </SafeAreaView>
        </LinearGradient >
    );
};

export default ReportsScreen;
