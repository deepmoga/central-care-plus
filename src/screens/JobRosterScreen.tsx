import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/JobRosterStyles';
import { useAuthStore } from '../store/authStore';
import { getJobs } from '../api/jobs.service';
import { getClientServices } from '../api/user.service';
import { Job } from '../models/job.model';
import JobCard from '../components/JobCard';
import { RootStackParamList } from '../navigation/RootNavigator';
import ActivityIndicatorComponent from '../components/ActivityIndicator';
import WeekCalendar from '../components/WeekCalendar';

const JobRosterScreen = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { user, role } = useAuthStore();
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);

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

    useFocusEffect(
        useCallback(() => {
            fetchWeeklyJobs();
        }, [currentWeekStart])
    );

    /**
     * ---------- FORMAT WEEK RANGE ----------
     */


    /**
     * ---------- PREV / NEXT WEEK ----------
     */
    const handleWeekChange = (direction: 'prev' | 'next') => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(
            currentWeekStart.getDate() + (direction === 'next' ? 7 : -7)
        );
        setCurrentWeekStart(newStart);
        setSelectedDate(null); // Reset selection on week change
    };

    const handleDayPress = (date: Date) => {
        const dateStr = normalizeLocalDate(date);
        if (selectedDate === dateStr) {
            setSelectedDate(null); // Deselect
        } else {
            setSelectedDate(dateStr);
        }
    };
    /**
     * ---------- FETCH JOBS ----------
     * backend expects YYYY-MM-DD
     */
    const fetchWeeklyJobs = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const formatDate = (date: Date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            };

            const startDate = formatDate(currentWeekStart);

            const end = new Date(currentWeekStart);
            end.setDate(currentWeekStart.getDate() + 6);
            const endDate = formatDate(end);
            if (role === 'client') {
                const response = await getClientServices(user.id, startDate, endDate);
                setJobs(response.data);
            } else {
                const response = await getJobs(user.id, startDate, endDate);
                setJobs(response.data);
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * ---------- VERY IMPORTANT ----------
     * Normalize dates WITHOUT UTC conversion
     * NEVER use toISOString() for date-only strings
     */
    const normalizeLocalDate = (value: Date) => {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // API already gives YYYY-MM-DD → treat as calendar date
    const normalizeApiDate = (value: string) => value;

    /**
     * ---------- GROUP JOBS BY DAY ----------
     */
    const groupJobsByDate = (jobs: Job[]) => {
        const sections: { title: string; data: Job[] }[] = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekStart);
            date.setDate(currentWeekStart.getDate() + i);

            const uiKey = normalizeLocalDate(date);

            const dayJobs = jobs?.filter(
                job => normalizeApiDate(job.service_date) === uiKey
            );

            if (dayJobs?.length > 0) {
                sections.push({
                    title: date.toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                    }),
                    data: dayJobs,
                });
            }
        }

        return sections;
    };

    const sections = groupJobsByDate(jobs).filter(section => {
        if (!selectedDate) return true;
        return true;
    });

    const filteredJobs = selectedDate
        ? jobs.filter(job => normalizeApiDate(job.service_date) === selectedDate)
        : jobs;

    const finalSections = groupJobsByDate(filteredJobs);

    return (
        <LinearGradient
            colors={theme.backgroundGradient as [string, string, ...string[]]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.container} edges={['top']}>

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Job Roster</Text>

                    <WeekCalendar
                        currentWeekStart={currentWeekStart}
                        onWeekChange={handleWeekChange}
                        selectedDate={selectedDate}
                        onDayPress={handleDayPress}
                    />
                </View>

                {/* <View style={styles.content} >
                    <Text style={styles.noJobsText} onPress={() => navigation.navigate('Document', { clientId: 1138, clientName: 'John Doe' })}>Jobs</Text>
                </View> */}

                {/* Content */}
                {loading ? (
                    <ActivityIndicatorComponent />
                ) : !finalSections || finalSections.length === 0 ? (
                    <View style={styles.noJobsContainer}>
                        <Text style={styles.noJobsText}>
                            No jobs scheduled for this week.
                        </Text>
                    </View>
                ) : (
                    <SectionList
                        sections={finalSections}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <JobCard
                                job={item}
                                theme={theme}
                                onPress={() => {
                                    navigation.navigate('JobDetail', {
                                        jobId: item.id,
                                        jobTable: item.table,
                                    })
                                }
                                }
                            />
                        )}
                        renderSectionHeader={({ section }) => (
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionHeaderText}>
                                    {section.title}
                                </Text>
                            </View>
                        )}
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                        stickySectionHeadersEnabled={false}
                    />
                )}
            </SafeAreaView>
        </LinearGradient>
    );
};

export default JobRosterScreen;
