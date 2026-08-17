import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { Job } from '../models/job.model';
import { ThemeColors } from '../theme/types';
import { createStyles } from '../styles/DashboardStyles'
import { jobStatus } from '../api/jobs.service';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';

interface JobCardProps {
    job: Job;
    theme: ThemeColors;
    onPress: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, theme, onPress }) => {
    const styles = createStyles(theme);
    const { isDark } = useTheme();
    const { role } = useAuthStore();
    const whiteScreenLogoCare = require('../../assets/CompanyLogoWhiteCare.png');
    const blackScreenLogoCare = require('../../assets/CompanyLogoBlackCare.png');
    const whiteScreenLogoHaisey = require('../../assets/CompanyLogoWhiteHaisey.png');
    const blackScreenLogoHaisey = require('../../assets/CompanyLogoBlackHaisey.png');

    const companyLogo = job.client_company_id === 2 ? (isDark ? blackScreenLogoCare : whiteScreenLogoCare) : (isDark ? blackScreenLogoHaisey : whiteScreenLogoHaisey);
    const profilePhoto = role === 'client' ? job.carer_profile_photo : job.profile_photo;

    const formatUiDate = (date: string) => {
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
    };

    return (
        // <SafeAreaView style={styles.container} edges={['top']}>
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.jobCard,
                pressed && { opacity: 0.6 },
            ]}

        >
            {/* Header */}
            <View style={styles.cardHeader}>
                <Text style={styles.serviceName} numberOfLines={2}>{job.service_name}</Text>
                <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
            </View>

            <View style={styles.divider} />

            {/* Body */}
            <View style={styles.cardBody}>
                <View style={styles.clientInfo}>
                    <View style={styles.jobAvatar}>
                        {job.profile_photo || job.carer_profile_photo ?
                            <Image source={{ uri: `${process.env.EXPO_PUBLIC_BASE_URL}${profilePhoto}` }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                            :
                            <Ionicons name="person" size={20} color="#fff" />
                        }
                    </View>
                    <View style={styles.nameContainer}>
                        <Text style={styles.clientName}>{role === 'client' ? job.carer_user_name : job.client_name}</Text>
                        {/* <Text style={styles.clientAgency}>{job.client_company_name}</Text> */}
                        {role !== 'client' && <Text style={styles.familyName}>{job.family_name}</Text>}
                    </View>
                </View>

                <View style={styles.badgesContainer}>
                    {/* <View style={[styles.statusBadge, { backgroundColor: job.status_color }]}>
                        <Text style={[styles.statusText, { color: '#ffffff' }]}>
                            {job.status_title}
                        </Text>
                    </View> */}
                    {/* <View style={[styles.statusBadge, job.status_id === 1 ? styles.statusPending : job.status_id === 2 ? styles.statusInProgress : job.status_id === 3 ? styles.statusCompleted : styles.statusPending]}>
                        <Text style={[styles.statusText, job.status_id === 1 ? styles.textPending : job.status_id === 2 ? styles.textInProgress : job.status_id === 3 ? styles.textCompleted : styles.statusText]}>
                            {job.status_id === 1 ? 'Pending' : job.status_id === 2 ? 'In-Progress' : job.status_id === 3 ? 'Completed' : 'Pending'}
                        </Text>
                    </View> */}
                    {role !== 'client' &&
                        (<View style={job.client_company_id === 1 ? styles.locationBadge : styles.locationBadge2}>
                            <Text style={job.client_company_id === 1 ? styles.locationBadgeText : styles.locationBadgeText2}>{job.client_branch_name}</Text>
                        </View>)}

                </View>
            </View>

            <View style={[styles.autoCheckoutBadge, { marginBottom: 10, marginTop: 0, backgroundColor: job.status_color }]}>
                <Text style={[styles.autoCheckoutText, { color: '#ffffff' }]}>{job.status_title}</Text>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
                <View style={styles.timeBadge}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "flex-start", marginBottom: 6 }}>
                        <Feather name="calendar" size={14} color={theme.timeFeather} style={{ marginRight: 6 }} />
                        <Text style={styles.timeText}>{formatUiDate(job.service_date)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Feather name="clock" size={14} color={theme.timeFeather} style={{ marginRight: 6 }} />
                        <Text style={styles.timeText}>{job.service_start_time} - {job.service_end_time}</Text>
                    </View>

                </View>
                <View>
                    <Image source={companyLogo} style={{ width: 100, height: 40 }} resizeMode='contain' />
                </View>
            </View>
        </Pressable >
        // </SafeAreaView>
    );
};

export default JobCard;
