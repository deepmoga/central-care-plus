import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { createStyles } from '../styles/PendingSignatureStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { getJobs } from '../api/jobs.service';
import { Job } from '../models/job.model';
import JobCard from '../components/JobCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import ActivityIndicatorComponent from '../components/ActivityIndicator';

const PendingSignatureScreen = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { not_complete_count, not_complete_label, carerId } = route.params as { not_complete_count: number, not_complete_label: string, carerId: number };

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    // const [refreshing, setRefreshing] = useState(false);

    const fetchJobs = async () => {
        try {
            // Status 4 is for Checkout / Pending Signature based on previous analysis
            const response = await getJobs(carerId, '', '', 'not_complete');
            if (response && Array.isArray(response.data)) {
                setJobs(response.data);
            } else {
                setJobs([]);
            }
        } catch (error) {
            console.error("Failed to load pending signature jobs", error);
        } finally {
            setLoading(false);
            // setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchJobs();
        }, [carerId])
    );

    // const onRefresh = useCallback(() => {
    //     setRefreshing(true);
    //     fetchJobs();
    // }, []);

    return (
        <LinearGradient colors={theme.backgroundGradient as [string, string, ...string[]]} style={{ flex: 1 }}>
            <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.icon} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{not_complete_label}</Text>
                </View>

                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicatorComponent />
                    </View>
                ) : (
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
                    // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
                    >
                        {jobs.length === 0 ? (
                            <View style={styles.content}>
                                <Ionicons name="document-text-outline" size={64} color={theme.textSecondary} />
                                <Text style={styles.emptyText}>No pending signatures found.</Text>
                            </View>
                        ) : (
                            jobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    theme={theme}
                                    onPress={() => {
                                        navigation.navigate("JobDetail", { jobId: job.id, jobTable: job.table });
                                    }}
                                />
                            ))
                        )}
                    </ScrollView>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
};

export default PendingSignatureScreen;
