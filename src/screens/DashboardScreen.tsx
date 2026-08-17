import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/DashboardStyles';
import { getJobs } from '../api/jobs.service';
import { getClientServices } from '../api/user.service';
import { Job } from '../models/job.model';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import CustomModal from '../components/CustomModal';
import JobCard from '../components/JobCard';

import { LinearGradient } from 'expo-linear-gradient';
import ActivityIndicatorComponent from '../components/ActivityIndicator';

const DashboardScreen = () => {
    const { user, signOut, role } = useAuthStore();
    const { theme, isDark } = useTheme();
    const styles = createStyles(theme);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
    const [warningLabel, setWarningLabel] = useState({
        not_complete_label: "",
        not_complete_count: 0
    });

    const todayDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).replace(/\//g, "-");

    useFocusEffect(
        useCallback(() => {
            if (!user?.id) return;

            const loadJobs = async () => {
                setLoading(true);
                try {
                    if (role === 'client') {
                        const response = await getClientServices(user.id, todayDate, '');
                        setJobs(response.data);
                    } else {
                        const response = await getJobs(user.id, todayDate, '', '');
                        setJobs(response.data);
                        setWarningLabel({
                            not_complete_label: response.not_complete_label,
                            not_complete_count: response.not_complete_count
                        });
                    }
                } catch (error) {
                    console.error("Failed to load jobs", error);
                } finally {
                    setLoading(false);
                }
            };

            loadJobs();
        }, [user?.id, todayDate])
    );

    const handleLogout = () => {
        setLogoutModalVisible(false);
        signOut();
    };

    return (
        <LinearGradient colors={theme.backgroundGradient as [string, string, ...string[]]} style={{ flex: 1 }}>
            <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.userInfo}>
                            <View style={styles.avatarContainer}>
                                {user?.profile_photo ?
                                    <Image source={{ uri: `${process.env.EXPO_PUBLIC_BASE_URL}${user.profile_photo}` }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                                    :
                                    <Ionicons name="person" size={20} color={theme.textSecondary} />
                                }
                            </View>
                            <Text style={styles.welcomeText}>Welcome, {role === 'client' ? user?.client_user_name : user?.user_name}</Text>
                        </View>
                        <TouchableOpacity style={styles.notificationButton} >
                            <Feather name="log-out" size={24} color={theme.icon} onPress={() => setLogoutModalVisible(true)} />
                        </TouchableOpacity>

                    </View>

                    {/* Stats Cards */}
                    {role !== 'client' && (
                        <>

                            <View style={styles.statsContainer}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statLabel}>Total Jobs</Text>
                                    {/* <View style={styles.statValueContainer}> */}
                                    {/* <Ionicons name="briefcase-outline" size={18} color={theme.textSecondary} style={{ marginRight: 4 }} /> */}
                                    <Text style={styles.statValue}>{jobs ? jobs?.length : 0}</Text>
                                    {/* </View> */}
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statLabel}>Pending Jobs</Text>
                                    <Text style={styles.statValue}>{jobs ? jobs?.filter(job => job.status_id === 1).length : 0}</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statLabel}>Jobs Done</Text>
                                    {/* <View style={styles.alertValueContainer}> */}
                                    {/* <View style={styles.alertIcon}>
                                    <Text style={styles.alertIconText}>!</Text>
                                </View> */}
                                    <Text style={styles.statValue}>{jobs ? jobs?.filter(job => job.status_id === 3).length : 0}</Text>
                                    {/* <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} style={{ marginLeft: 'auto' }} /> */}
                                    {/* </View> */}
                                </View>
                            </View>
                            {warningLabel.not_complete_count > 0 && role !== 'client' && (
                                <TouchableOpacity style={styles.warningButton} onPress={() => navigation.navigate('PendingSignature', { not_complete_label: warningLabel?.not_complete_label, not_complete_count: warningLabel?.not_complete_count, carerId: user?.id })}>
                                    <View style={styles.warningIconContainer}>
                                        <Ionicons name="hourglass-outline" size={20} color="#fff" />
                                    </View>
                                    <Text style={styles.warningButtonText}>{warningLabel.not_complete_label} - {warningLabel.not_complete_count}</Text>
                                    <View style={styles.warningIconContainer}>
                                        <Ionicons name="chevron-forward" size={20} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </>
                    )}


                    {/* Today's Jobs */}
                    {loading ? (
                        <>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
                                <ActivityIndicatorComponent />
                            </View>
                        </>
                    ) : (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{role === 'client' ? "Today's Services" : "Today's Jobs"}</Text>
                                <TouchableOpacity>
                                    <Text style={styles.viewAllText} onPress={() => navigation.navigate("JobRoster")}>View All</Text>
                                </TouchableOpacity>
                            </View>
                            {!jobs || jobs.length === 0 ? (
                                <View style={styles.noJobsContainer}>
                                    <Text style={{ fontSize: 16, color: theme.textSecondary }}>No jobs scheduled for today...</Text>
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
                        </View>
                    )}
                </ScrollView>

                <CustomModal
                    visible={isLogoutModalVisible}
                    onClose={() => setLogoutModalVisible(false)}
                    title="Sign Out"
                    message="Are you sure you want to sign out?"
                    confirmText="Sign Out"
                    cancelText="Stay"
                    onConfirm={handleLogout}
                    type="warning"
                />
            </SafeAreaView >
        </LinearGradient>
    );
};

export default DashboardScreen;
