import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/JobDetailStyles';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getJobById, jobStatus, checkOutJob, checkActiveJobStatus, getServiceCuresAlerts } from '../api/jobs.service';
import { JobDetail } from '../models/job.model';
import CheckOutModal from '../components/CheckOutModal';
import CustomModal from '../components/CustomModal';
import ActivityIndicatorComponent from '../components/ActivityIndicator';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { useJobStore } from '../store/jobStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuthStore } from '../store/authStore';
import { registerForPushNotificationsAsync, scheduleCheckoutReminder, cancelJobNotifications } from '../utils/notification.utils';

const JobDetailScreen = () => {
    const { theme, isDark } = useTheme();
    const styles = createStyles(theme);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { role, user } = useAuthStore();
    const route = useRoute();
    const { jobId, jobTable } = route.params as { jobId: number, jobTable: string };
    const routeParams = route.params as { signature?: string };

    const [job, setJob] = useState<JobDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLookListenSubmitted, setIsLookListenSubmitted] = useState(false);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const isJobExpired = (() => {
        if (!job) return false;
        const signLastDateStr = job.sign_last_date || job.service_date;
        if (!signLastDateStr) return false;
        const signLastDate = new Date(signLastDateStr);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        signLastDate.setHours(0, 0, 0, 0);
        return now > signLastDate;
    })();

    useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);

    // Check-In/Out Logic
    // Check-In/Out Logic
    const { setCheckIn, setCancelEnabled, clearJobState, setJobDetails, clearAllJobStates, isAnyJobActive } = useJobStore();
    const jobState = useJobStore(state => state.jobs[jobId]);

    const isCheckedIn = jobState?.isCheckedIn || false;
    const checkInTime = jobState?.checkInTime ? jobState.checkInTime : null;
    const isCancelEnabled = jobState?.isCancelEnabled || false;

    // Persistent Fields from Store
    const privateKms = jobState?.privateKms || '';
    const outingKms = jobState?.outingKms || '';
    const comment = jobState?.comment || '';

    const [cancelTimer, setCancelTimer] = useState(0); // in seconds
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const [isCheckOutModalVisible, setIsCheckOutModalVisible] = useState(false);
    const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);


    const whiteScreenLogoCare = require('../../assets/CompanyLogoWhiteCare.png');
    const blackScreenLogoCare = require('../../assets/CompanyLogoBlackCare.png');
    const whiteScreenLogoHaisey = require('../../assets/CompanyLogoWhiteHaisey.png');
    const blackScreenLogoHaisey = require('../../assets/CompanyLogoBlackHaisey.png');

    const companyLogo = job?.client_company_id === 2 ? (isDark ? blackScreenLogoCare : whiteScreenLogoCare) : (isDark ? blackScreenLogoHaisey : whiteScreenLogoHaisey);
    const [signature, setSignature] = useState('');

    const handleSignatureOK = (signature: string) => {
        setSignature(signature);
    };

    const handleSignatureEmpty = () => {
        setSignature('');
    };

    const [tasks, setTasks] = useState([
        { id: 1, text: 'Administer morning medication', completed: false },
        { id: 2, text: 'Assist with shower', completed: false },
        { id: 3, text: 'Prepare light lunch', completed: false },
    ]);
    const dateToday = new Date(); // "2025-12-25"
    const today = `${dateToday.getFullYear()}-${String(dateToday.getMonth() + 1).padStart(2, '0')}-${String(dateToday.getDate()).padStart(2, '0')}`;

    const fetchJobDetail = async () => {

        setLoading(true);
        try {
            const response = await getJobById(jobId, jobTable);

            if (response.success && response.data) {
                setJob(response.data);

                // Initialize state based on job data (e.g., if already clocked in)
                if (response.data.clock_in && response.data.status_id === 1) {
                    // Sync store with API data if needed, but respect existing store state for cancel
                    if (!isCheckedIn) {
                        setCheckIn(jobId, response.data.clock_in);
                    }
                } else if (response.data.status_id === 2) {
                    setSignature(response.data.signature);
                } else if (response.data.status_id === 1) {


                    // Sync to store if store is empty but API has data (e.g. re-install or clear data)
                    if (!privateKms && response.data.private_kms) setJobDetails(jobId, { privateKms: response.data.private_kms.toString() });
                    if (!outingKms && response.data.outing_kms) setJobDetails(jobId, { outingKms: response.data.outing_kms.toString() });
                    if (!comment && response.data.comments) setJobDetails(jobId, { comment: response.data.comments });

                    // Always update signature from API
                    setSignature(response.data.signature);
                }

                if (role !== 'client') {
                    const alertsResponse = await getServiceCuresAlerts(jobId, jobTable);
                    if (alertsResponse?.success && alertsResponse.data && alertsResponse.data.length > 0) {
                        setIsLookListenSubmitted(true);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch job details", error);
        } finally {
            // Small timeout to ensure state updates have processed and UI is ready to render
            setTimeout(() => {
                setLoading(false);
            }, 100);
        }
    };
    useFocusEffect(useCallback(() => {
        fetchJobDetail();

    }, [jobId, jobTable]));

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isCancelEnabled && jobState?.cancelExpirationTime) {
            const updateTimer = () => {
                const now = new Date().getTime();
                const expiration = new Date(jobState.cancelExpirationTime!).getTime();
                const remaining = Math.floor((expiration - now) / 1000);

                if (remaining > 0) {
                    setCancelTimer(remaining);
                } else {
                    setCancelTimer(0);
                    setCancelEnabled(jobId, false, null);
                }
            };

            updateTimer(); // Initial call
            interval = setInterval(updateTimer, 1000);
        } else {
            setCancelTimer(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isCancelEnabled, jobState?.cancelExpirationTime, jobId, setCancelEnabled]);


    const [checkInLoading, setCheckInLoading] = useState(false);

    const handleCheckIn = async () => {
        setCheckInLoading(true);
        if (isCancelEnabled) {
            // Cancel Action
            // Cancel notifications
            if (jobState?.notificationIds) {
                await cancelJobNotifications(jobState.notificationIds);
            }

            // Optimistic update
            setCheckIn(jobId, null as any); // Type cast if needed or handle null in store
            setCancelEnabled(jobId, false, null);
            clearJobState(jobId);


            // Call API to cancel check-in
            try {
                const payload = {
                    id: jobId,
                    status_id: 1,
                    clock_in: "",
                    table: job?.table,
                    clock_in_date: "",
                    location_in_latitude: "",
                    location_in_longitude: "",
                };
                await jobStatus(payload);
                // Update local job state
                setJob(prev => prev ? { ...prev, status_id: 1 } : null);
            } catch (error) {
                console.error("Cancel check-in failed", error);
                // Revert if needed, but for now assume success or user can try again
            } finally {
                setCheckInLoading(false);
            }
            return;
        }

        // Check for concurrent jobs
        const carerId = user?.id || 0;
        try {
            const activeStatusResponse = await checkActiveJobStatus(carerId);
            if (activeStatusResponse?.status === true) {
                Alert.alert("Active Job", "You already have a job in progress. Please finish it before starting a new one.");
                setCheckInLoading(false);
                return;
            } else {
                clearAllJobStates();
            }
        } catch (error) {
            console.error("Failed to check active job status", error);
        }

        // Check Location Permission
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
            const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
            if (newStatus !== 'granted') {
                Toast.show({
                    type: 'error',
                    text1: 'Permission Denied',
                    text2: 'Please enable location services first.',
                });
                setCheckInLoading(false);
                return;
            }
        }

        // Get Location
        let location;
        try {
            location = await Location.getCurrentPositionAsync({});
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Location Error',
                text2: 'Could not fetch location.',
            });
            setCheckInLoading(false);
            return;
        }

        // Check-In Action
        const now = new Date();
        const expirationTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
        const currentClockIn = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })

        // Schedule notifications
        let notificationIds: string[] = [];
        if (job) {
            notificationIds = await scheduleCheckoutReminder(jobId, job.service_date, job.service_end_time);
        }

        setCheckIn(jobId, currentClockIn, notificationIds);
        setCancelEnabled(jobId, true, expirationTime.toISOString());

        // Call API
        try {
            const payload = {
                id: jobId,
                status_id: 2,
                clock_in: currentClockIn,
                table: job?.table,
                clock_in_date: job?.clock_in_date,
                location_in_latitude: location.coords.latitude,
                location_in_longitude: location.coords.longitude,
            };

            await jobStatus(payload);
            // Update local job state

            setJob(prev => prev ? { ...prev, status_id: 2 } : null);
        } catch (error) {
            console.error("Check-in failed", error);
            // Alert.alert("Error", "Failed to check in. Please try again.");
            // Revert store state
            clearJobState(jobId);
        } finally {
            setCheckInLoading(false);
        }
    };


    const handleCheckOutPress = () => {
        setIsCheckOutModalVisible(true);
    };

    const handleCheckOutConfirm = async (applySchedule: boolean) => {
        setLoading(true)

        // Cancel notifications
        if (jobState?.notificationIds) {
            await cancelJobNotifications(jobState.notificationIds);
        }

        // Get Location for Checkout
        let location;
        try {
            location = await Location.getCurrentPositionAsync({});
        } catch (error) {
            console.log("Location error", error);
        }

        const now = new Date();
        const clockOutTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
        const clockOutDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const statusId = job?.is_signature === 1 ? 3 : 4;

        const checkOutData = {
            id: jobId,
            table: job?.table,
            clock_out: clockOutTime,
            status_id: statusId, // 3: Completed, 4: Checkout (Pending Signature)
            signature: '',
            comment: comment, // User asked to send null if no value
            clock_out_date: clockOutDate,
            location_out_latitude: location?.coords.latitude,
            location_out_longitude: location?.coords.longitude,
            private_kms: privateKms || "",
            outing_kms: outingKms || "",
            apply_schedule: applySchedule ? 1 : 0
        };

        try {
            const response = await checkOutJob(checkOutData);
            if (response.success) {
                setIsCheckOutModalVisible(false);
                setLoading(false);
                // Update local job state
                // Update local job state
                setJob(prev => prev ? { ...prev, status_id: statusId } : null);
                clearJobState(jobId); // Clear persistent state on checkout

                // Refresh details
                await fetchJobDetail();
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Job checked out successfully',
                });
                setCancelEnabled(jobId, false, null);
            }
        } catch (error) {
            console.error("Check-out failed", error);
        }
    };
    if (loading) {
        return (
            <ActivityIndicatorComponent />
        )
    }

    if (!job) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text }}>Job not found</Text>
            </View>
        );
    }



    const STATUS_MAP: { [key: number]: { label: string; color: string } } = {
        1: { label: 'Pending', color: '#D48806' },
        2: { label: 'In-Progress', color: '#096DD9' },
        3: { label: 'Completed', color: '#389E0D' },
        4: { label: 'Checkout', color: '#531DAB' },
        5: { label: 'Auto-Checkout', color: '#1D39C4' },
        6: { label: 'Auto-Complete', color: '#237804' },
    };

    const getStatusDetails = (statusId: number) => {
        return STATUS_MAP[statusId] || STATUS_MAP[1];
    };


    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };


    const isToday = job.service_date === today;

    const isJobCompleted = job.status_id !== 1 && job.status_id !== 2;
    const hasClockIn = !!(isCheckedIn || job?.clock_in?.length > 0 || checkInTime);

    const clockInDisplay = job.clock_in
        ? job.clock_in


        : checkInTime
            ? checkInTime

            : '';

    return (
        <LinearGradient colors={theme.backgroundGradient as [string, string, ...string[]]} style={{ flex: 1 }}>
            <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
                <ScrollView 
                    style={styles.scrollView} 
                    showsVerticalScrollIndicator={false} 
                    scrollEnabled={scrollEnabled}
                    keyboardDismissMode="on-drag"
                >
                    {/* Header with Status */}
                    <View style={styles.header}>
                        {/* User Details Section */}
                        <View style={styles.clientInfo}>
                            <View >
                                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>
                            <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => {
                                if (role === "client" && job.carer_id !== 0) {
                                    navigation.navigate('ClientProfile', {
                                        clientId: job.carer_id
                                    })
                                } else if (role === "carer") {
                                    navigation.navigate('ClientProfile', {
                                        clientId: job.client_id
                                    })
                                }
                            }}>
                                <View style={styles.avatar}>
                                    {job.profile_photo ? (
                                        <Image
                                            source={{ uri: `${process.env.EXPO_PUBLIC_BASE_URL}${role === 'client' ? job.carer_profile_photo : job.profile_photo}` }}
                                            style={{ width: 64, height: 64, borderRadius: 32 }}
                                        />
                                    ) : (
                                        <Ionicons name="person" size={32} color="#fff" />
                                    )}
                                </View>
                                <View style={styles.clientDetails}>
                                    <Text style={styles.clientName}>{role === 'client' ? job.carer_user_name : job.client_name} </Text>
                                    {role !== "client" && (
                                        <>
                                            <Text style={[styles.clientName, { fontSize: 10 }]}>{job.family_name}</Text>
                                            <Text style={styles.agencyName}>{job.company_name}</Text>
                                            <Text style={[styles.agencyName, { fontSize: 12, marginTop: 2 }]}>{job.branch_name}</Text>
                                        </>
                                    )
                                    }

                                </View>
                                <View style={styles.clientDetails}>
                                    <View style={[styles.backButton, { marginLeft: 30 }]}>
                                        <Ionicons name="document-text-outline" size={24} color={theme.text} />
                                    </View>
                                </View>
                            </Pressable>

                        </View>




                    </View>


                    {/* Job Details Section */}
                    <View style={styles.section}>
                        <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: "flex-start" }}>
                            {/* <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: "center" }}>
                                <View><Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>Status:</Text></View>
                                <View style={[styles.statusBadge, { backgroundColor: job.status_id <= 2 ? getStatusDetails(job.status_id).color : job.status_color, marginHorizontal: 4 }]}>
                                    <Text style={[styles.statusText, { color: '#ffffff' }]}>
                                        {job.status_id <= 2 ? getStatusDetails(job.status_id).label : job.status_title}
                                    </Text>
                                </View>
                            </View> */}
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{role === 'client' ? 'Service Details' : 'Job Details'}</Text>
                                {/* <TouchableOpacity onPress={() => setIsTaskModalVisible(true)} style={{ marginLeft: 10 }}>
                                    <Ionicons name="list-circle-outline" size={24} color={theme.primary} />
                                </TouchableOpacity> */}
                            </View>
                            {/* Status Section */}
                            <View>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: "center", marginBottom: 6 }}>
                                    <View><Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>Status:</Text></View>
                                    <View style={[styles.statusBadge, { backgroundColor: job.status_id <= 2 ? getStatusDetails(job.status_id).color : job.status_color, marginHorizontal: 4 }]}>
                                        <Text style={[styles.statusText, { color: '#ffffff' }]}>
                                            {job.status_id <= 2 ? getStatusDetails(job.status_id).label : job.status_title}
                                        </Text>
                                    </View>
                                </View>
                                {/* <View style={[styles.statusBadge, getStatusStyle(job.status_id)]}>
                                    <Text style={[styles.statusText, getStatusTextStyle(job.status_id)]}>
                                        {job.status_id === 0 ? 'Pending' : job.status_id === 1 ? 'In-Progress' : 'Completed'}
                                    </Text>
                                </View> */}
                                {/* <View style={[styles.statusBadge, { backgroundColor: getStatusDetails(job.status_id).color, marginBottom: 6 }]}>
                                    <Text style={[styles.statusText, { color: '#ffffff' }]}>
                                        {getStatusDetails(job.status_id).label}
                                    </Text>
                                </View> */}
                            </View>
                        </View>
                        <View style={styles.jobMeta}>
                            <Text style={[styles.noteText, { marginBottom: 10, fontSize: 16, fontWeight: 'bold' }]}>{job.service_name}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: "center", marginBottom: 10 }}>
                                <Pressable style={[styles.statusBadge, { backgroundColor: "#EBF8FF", flexDirection: 'row', alignItems: 'center' }]} onPress={() => setIsTaskModalVisible(true)}>
                                    <Text style={[styles.statusText, { color: '#3182CE' }]}>
                                        Tasks List
                                    </Text>
                                    <View style={{ marginLeft: 10 }}>
                                        <Ionicons name="list-circle-outline" size={24} color={theme.primary} />
                                    </View>
                                </Pressable>
                                <View>
                                    <Image source={companyLogo} style={{ width: 100, height: 40 }} resizeMode='contain' />
                                </View>
                            </View>
                            {role === 'client' && (
                                <View style={styles.metaRow}>
                                    <Feather name="user" size={16} color={theme.textSecondary} />
                                    <Text style={styles.metaText}>
                                        {job.carer_user_name}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.metaRow}>
                                <Feather name="calendar" size={16} color={theme.textSecondary} />
                                <Text style={styles.metaText}>
                                    {new Date(job.service_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </Text>
                            </View>
                            <View style={styles.metaRow}>
                                <Feather name="clock" size={16} color={theme.textSecondary} />
                                <Text style={styles.metaText}>
                                    {job.service_start_time} – {job.service_end_time}
                                </Text>
                            </View>
                            {/* 
                            {isCheckedIn || clockIncheck || checkInTime && (
                                <View style={styles.metaRow}>
                                    <Feather name="check-circle" size={16} color={theme.success} />
                                    <Text style={[styles.metaText, { color: theme.success }]}>
                                        Clocked In: {job.clock_in ? new Date(job.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            )} */}
                            {hasClockIn && (
                                <>
                                    <View style={styles.metaRow}>
                                        <Feather name="check-circle" size={16} color={theme.success} />
                                        <Text style={[styles.metaText, { color: theme.success }]}>
                                            Clocked In: {clockInDisplay}
                                        </Text>
                                    </View>
                                    <View style={styles.metaRow}>
                                        <Feather name="check-circle" size={16} color={theme.success} />
                                        <Text style={[styles.metaText, { color: theme.success }]}>
                                            Clocked Out: {job.clock_out ? job.clock_out : "Not Clocked Out"}
                                        </Text>
                                    </View>
                                </>
                            )}




                            {job.client_address && (
                                <>
                                    <View style={styles.metaRow}>
                                        <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
                                        <Text style={styles.metaText}>{job.client_address}</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>

                    {job.instructions && (
                        <>

                            <View style={styles.section}>

                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Instructions</Text>
                                </View>

                                <View style={styles.jobMeta}>
                                    <Text style={[styles.noteText, { marginBottom: 10, fontSize: 16 }]}>{job.instructions}</Text>
                                </View>
                            </View>
                        </>
                    )}

                    {/* Kms and Comment Section - Carer Only */}
                    {(isCheckedIn || isJobCompleted) && role !== 'client' && (
                        <>
                            <View style={styles.section}>
                                <View style={styles.jobMeta}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>Outing Kms</Text>
                                    </View>
                                    <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 12 }}>
                                        Total KMs driven during this outing. Record the distance travelled while transporting to and from their appointments.
                                    </Text>
                                    <TextInput
                                        style={[styles.input, isJobCompleted && { opacity: 0.6, backgroundColor: theme.border }]}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={theme.textTertiary}
                                        value={isJobCompleted ? (job.outing_kms?.toString() || '') : outingKms}
                                        onChangeText={(text) => setJobDetails(jobId, { outingKms: text })}
                                        editable={!isJobCompleted}
                                        maxLength={3}
                                    />
                                </View>
                            </View>

                            <View style={{ paddingHorizontal: 24, marginBottom: 4 }}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Comment</Text>
                                    <TextInput
                                        style={[styles.input, isJobCompleted && { opacity: 0.6, backgroundColor: theme.border }, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                                        multiline
                                        placeholder="Add a comment..."
                                        placeholderTextColor={theme.textTertiary}
                                        value={isJobCompleted ? job?.comment : comment}
                                        onChangeText={(text) => setJobDetails(jobId, { comment: text })}
                                        editable={!isJobCompleted}
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    {/* Signature Section - Client or (Carer when checked in/completed) */}
                    {((isCheckedIn || isJobCompleted) || role === 'client') && (
                        <View style={{ paddingHorizontal: 24 }}>
                            <View style={styles.inputGroup}>
                                {/* Show Signature Image if Completed */}
                                {isJobCompleted && job.signature ? (
                                    <>
                                        <Text style={styles.inputLabel}>Client Signature</Text>
                                        <View style={{ height: 200, width: '100%', opacity: 0.6 }}>
                                            <Image
                                                source={{ uri: job.signature }}
                                                style={{ width: '100%', height: '100%', resizeMode: 'contain', opacity: 0.6, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 12, backgroundColor: "#ededed" }}
                                            />
                                        </View>
                                    </>
                                ) : null}

                                {/* Blank Signature for Expired Jobs */}
                                {(() => {
                                    const signLastDateStr = job.sign_last_date || job.service_date;
                                    const signLastDate = new Date(signLastDateStr);
                                    const now = new Date();
                                    now.setHours(0, 0, 0, 0);
                                    signLastDate.setHours(0, 0, 0, 0);
                                    const isExpired = now > signLastDate;

                                    // If expired and NO signature (and job not completed or signature is 0)
                                    if (isExpired && job.is_signature === 0) {
                                        return (
                                            <View style={{ marginTop: 8 }}>
                                                <Text style={styles.inputLabel}>Client Signature</Text>
                                                <View style={{
                                                    height: 200,
                                                    width: '100%',
                                                    borderWidth: 1,
                                                    borderColor: theme.inputBorder,
                                                    borderRadius: 12,
                                                    backgroundColor: "#f5f5f5",
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    <Text style={{ color: theme.textTertiary }}>Signature Not Captured</Text>
                                                </View>
                                            </View>
                                        );
                                    }
                                    return null;
                                })()}

                                {/* Capture Signature Button using job.is_signature check */}
                                {job.is_signature !== 1 && (
                                    <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
                                        {(() => {
                                            const signLastDateStr = job.sign_last_date || job.service_date;
                                            const signLastDate = new Date(signLastDateStr);
                                            const now = new Date();
                                            now.setHours(0, 0, 0, 0);
                                            signLastDate.setHours(0, 0, 0, 0);
                                            const isExpired = now > signLastDate;
                                            const isSigned = job.is_signature === 1;

                                            return (
                                                <TouchableOpacity
                                                    style={{
                                                        flex: 1,
                                                        padding: 12,
                                                        backgroundColor: (isSigned || isExpired) ? theme.border : theme.surface,
                                                        borderWidth: 1,
                                                        borderColor: (isSigned || isExpired) ? theme.border : theme.primary,
                                                        borderRadius: 12,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                    disabled={isSigned || isExpired}
                                                    onPress={() => navigation.navigate('Signature', { jobId: job?.id, jobTable: job?.table })}
                                                >
                                                    <Text style={{ color: (isSigned || isExpired) ? theme.textSecondary : theme.primary, fontWeight: '600', fontSize: 13 }}>
                                                        {isSigned ? 'Captured' : isExpired ? 'Signature Expired' : role === 'client' ? 'Sign Here' : 'Capture Signature'}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })()}
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}

                    {/* Notes Button */}
                    <View style={{ marginBottom: 8, marginHorizontal: 24 }}>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 12,
                                backgroundColor: theme.surface,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: theme.border,
                            }}
                            onPress={() => navigation.navigate('JobNotes', {
                                table_name: job.table,
                                service_id: job.id,
                                client_id: job.client_id,
                                carer_id: job.carer_id
                            })}
                        >
                            <Ionicons name="document-text-outline" size={18} color={theme.primary} style={{ marginRight: 6 }} />
                            <Text style={{ color: theme.text, fontWeight: '600', fontSize: 13 }}>{role === 'client' ? 'Add/Edit Comment' : 'Add/Edit Notes'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Rate Service Button - Client Only */}
                    {role === 'client' && (
                        <View style={{ marginBottom: 12, marginHorizontal: 24 }}>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 12,
                                    backgroundColor: isJobExpired ? theme.border : theme.surface,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: isJobExpired ? theme.border : theme.border,
                                }}
                                disabled={isJobExpired}
                                onPress={() => navigation.navigate('Rating', {
                                    jobId: job.id,
                                    carerId: job.carer_id,
                                    clientId: job.client_id,
                                    jobTable: jobTable
                                })}
                            >
                                <Ionicons name="star-outline" size={18} color={isJobExpired ? theme.textSecondary : "#F59E0B"} style={{ marginRight: 6 }} />
                                <Text style={{ color: isJobExpired ? theme.textSecondary : theme.text, fontWeight: '600', fontSize: 13 }}>
                                    {isJobExpired ? 'Review Expired' : 'Rate Service'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Look/Listen Tool Card */}
                    {role !== 'client' && (
                        <View style={styles.section}>
                            <View style={styles.jobMeta}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>Look & Listen Tool</Text>
                                    {isLookListenSubmitted && (
                                        <View style={{ backgroundColor: theme.success + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="checkmark-circle" size={12} color={theme.success} style={{ marginRight: 4 }} />
                                            <Text style={{ color: theme.success, fontWeight: '700', fontSize: 10, textTransform: 'uppercase' }}>Submitted</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 12 }}>
                                    If you have identified a change while caring for or observing a client, please tick the change, add any additional information where indicated.
                                </Text>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 12,
                                    backgroundColor: theme.primary,
                                    borderRadius: 12,
                                }}
                                onPress={() => navigation.navigate('LookListenTool', { 
                                    clientName: job.client_name, 
                                    serviceId: jobId, 
                                    tableName: jobTable, 
                                    carerId: job.carer_id, 
                                    clientId: job.client_id, 
                                    clientAddress: job.client_address,
                                    signLastDate: job.sign_last_date
                                })}
                            >
                                <Ionicons name="eye-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Open Tool</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    )}

                    {/* Temporary Log Emergency Button */}
                    {role !== 'client' && (
                        <TouchableOpacity
                            style={{
                                marginHorizontal: 24,
                                // marginBottom: 40,
                                padding: 12,
                                backgroundColor: '#FFEBEE',
                                borderRadius: 12,
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: '#FFCDD2'
                            }}
                            onPress={() => navigation.navigate('LogEmergency', {
                                carerId: job.carer_id,
                                clientId: job.client_id,
                                jobId: job.id,
                                clientName: `${job.client_name} ${job.family_name}`,
                                serviceDate: job.service_date,
                                serviceTime: `${job.service_start_time} - ${job.service_end_time}`,
                                profile_photo: job.profile_photo,
                                jobTable: job.table,
                                is_log_filled: job.is_log_filled
                            })}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="warning-outline" size={20} color="#D32F2F" style={{ marginRight: 8 }} />
                                <Text style={{ color: '#D32F2F', fontWeight: '600', fontSize: 13 }}>{job.is_log_filled === 1 ? 'View Emergency / Incident' : 'Log Emergency / Incident'}</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                </ScrollView>
                <View style={styles.actionButtonContainer}>
                    {(isToday || isCheckedIn) && role !== 'client' && (
                        <>
                            <TouchableOpacity
                                style={isCancelEnabled ? styles.cancelButton : (job.service_date !== today || isJobCompleted || isCheckedIn) ? styles.disabledButton : styles.checkInButton}
                                onPress={handleCheckIn}
                                disabled={isJobCompleted || (isCheckedIn ? !isCancelEnabled : job.service_date !== today)}
                            >
                                <Text style={isCancelEnabled ? styles.cancelButtonText : styles.checkInButtonText}>
                                    {isCancelEnabled ? `Cancel (${formatTimer(cancelTimer)})` : isCheckedIn || isJobCompleted ? 'Checked In' : 'Check In'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.checkOutButton, (!isCheckedIn || isJobCompleted) && styles.disabledButton]}
                                onPress={handleCheckOutPress}
                                disabled={!isCheckedIn || isJobCompleted}
                            >
                                <Text style={styles.checkOutButtonText}>{isJobCompleted ? 'Checked Out' : 'Check Out'}</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
                {checkInLoading && (
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 999
                    }}>
                        <ActivityIndicator size="large" color="#ffffff" />
                    </View>
                )}
            </SafeAreaView>

            <CheckOutModal
                visible={isCheckOutModalVisible}
                onClose={() => setIsCheckOutModalVisible(false)}
                onConfirm={handleCheckOutConfirm}
                checkInTime={checkInTime}
                privateKms={privateKms}
                outingKms={outingKms}
                signature={job.is_signature}
                scheduledStartTime={job.service_start_time}
                scheduledEndTime={job.service_end_time}
            />

            <CustomModal
                visible={isTaskModalVisible}
                onClose={() => setIsTaskModalVisible(false)}
                title="Task List"
                onConfirm={() => setIsTaskModalVisible(false)}
                confirmText="Close"
                type="info"
                cancelText="" // Hide cancel button
            >
                <View style={{ width: '100%', maxHeight: 300 }}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {job.task_list && job.task_list.length > 0 ? (
                            job.task_list.map((task: any, index: number) => (
                                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    <Ionicons name="checkmark-circle-outline" size={24} color={theme.success} style={{ marginRight: 10 }} />
                                    <Text style={{ fontSize: 16, color: theme.text, flex: 1 }}>{task.task_name || task}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={{ textAlign: 'center', color: theme.textSecondary, marginTop: 10 }}>No tasks available for this job.</Text>
                        )}
                    </ScrollView>
                </View>
            </CustomModal>
        </LinearGradient >
    );
};

export default JobDetailScreen;
