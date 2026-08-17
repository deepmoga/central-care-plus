import { StyleSheet } from 'react-native';
import { ThemeColors } from '../theme/types';

export const createStyles = (theme: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        marginTop: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.surface, // Use theme surface
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
        borderWidth: 2,
        borderColor: theme.card, // Use theme card color for border
    },
    welcomeText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.text,
        letterSpacing: 0.5,
    },
    notificationButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.card, // Use theme card
        borderRadius: 12,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: theme.badge,
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.card, // Use theme card
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    themeToggle: {
        marginLeft: 16,
        padding: 8,
    },
    locationSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.card, // Use theme card
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginLeft: 24,
        marginTop: 16,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    locationText: {
        marginHorizontal: 8,
        color: theme.text,
        fontSize: 14,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 6,
        gap: 6,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.card, // Use theme card
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 6,
        // minHeight: 100,
        justifyContent: 'space-between',
    },
    warningButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE', // Light red background
        padding: 12,
        borderRadius: 16,
        marginTop: 12,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#FEB2B2', // Red border
    },
    warningIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FC8181', // Red icon bg
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    warningButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#C53030', // Darker red text
        flex: 1,
    },
    statLabel: {
        fontSize: 13,
        color: theme.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    statValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.text,
        textAlign: 'left',
    },
    alertValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    alertIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.error,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    alertIconText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    dateSection: {
        marginTop: 32,
        paddingBottom: 16,
    },
    dateHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    dateRange: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
        marginHorizontal: 20,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
    },
    dayItem: {
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: theme.card, // Use theme card
        minWidth: 48,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedDayItem: {
        backgroundColor: theme.primary,
        shadowColor: theme.primary,
        shadowOpacity: 0.3,
        elevation: 8,
    },
    dayText: {
        fontSize: 12,
        color: theme.textSecondary,
        marginBottom: 4,
        fontWeight: '500',
    },
    selectedDayText: {
        color: '#fff',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 4,
    },
    selectedDateText: {
        color: '#fff',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'transparent',
    },
    selectedDot: {
        backgroundColor: '#fff',
    },
    section: {
        paddingHorizontal: 24,
        marginTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.text,
    },
    viewAllText: {
        fontSize: 14,
        color: theme.primary,
        fontWeight: '600',
    },
    jobCard: {
        backgroundColor: theme.card, // Use theme card
        borderRadius: 28,
        padding: 14,
        paddingTop: 10,
        marginBottom: 24,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 10,
        borderWidth: 1,
        borderColor: theme.border, // Use theme border
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        // marginBottom: 12,
    },
    serviceName: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.text,
        flex: 1,
        marginRight: 12,
        lineHeight: 24,
    },
    divider: {
        height: 1,
        backgroundColor: theme.borderLight,
        marginVertical: 5,
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    clientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    jobAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.borderLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameContainer: {
        marginLeft: 8,
        flex: 1,
    },
    clientName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.text,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    clientAgency: {
        fontSize: 12,
        color: theme.textSecondary,
        marginTop: 4,
        fontWeight: '500',
    },
    familyName: {
        fontSize: 10,
        color: theme.textTertiary,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    badgesContainer: {
        alignItems: 'flex-end',
        gap: 8,
        marginLeft: 8,


    },
    locationBadge2: {
        backgroundColor: '#F3E8FF', // Light purple
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    locationBadge: {
        backgroundColor: '#E6FFFA', // Light teal
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    locationBadgeText: {
        color: '#319795', // Teal
        fontSize: 8,
        fontWeight: '700',
    },
    locationBadgeText2: {
        color: '#805AD5', // Purple
        fontSize: 8,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusPending: {
        backgroundColor: '#FFFAF0', // Light orange
    },
    statusInProgress: {
        backgroundColor: '#EBF8FF', // Light blue
    },
    statusCompleted: {
        backgroundColor: '#E8F5E9',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    textPending: {
        color: '#DD6B20', // Orange
    },
    textInProgress: {
        color: '#3182CE', // Blue
    },
    textCompleted: {
        color: '#2E7D32',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // marginTop: 4,
    },
    timeBadge: {
        flexDirection: 'column',
        alignItems: "flex-start",
        backgroundColor: theme.timeCardBackground,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    timeText: {
        color: theme.timeText,
        fontSize: 11,
        fontWeight: '600',
    },
    notificationCount: {
        backgroundColor: theme.info,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    notificationCountText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    noJobsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    notificationCard: {
        backgroundColor: theme.card, // Use theme card
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    notificationHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    warningIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#FFF5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    warningIconText: {
        color: theme.error,
        fontWeight: 'bold',
        fontSize: 18,
    },
    infoIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EBF8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoIconText: {
        color: theme.info,
        fontWeight: 'bold',
        fontSize: 16,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: theme.textTertiary,
    },
    actionButton: {
        backgroundColor: '#EBF8FF',
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
        alignSelf: 'flex-end',
        paddingHorizontal: 20,
        marginTop: 8,
    },
    actionButtonText: {
        fontSize: 13,
        color: theme.info,
        fontWeight: '600',
    },
    signOutContainer: {
        paddingHorizontal: 24,
        marginTop: 32,
        marginBottom: 24,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.card, // Use theme card
        borderWidth: 1,
        borderColor: theme.border, // Use theme border
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 24,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    signOutText: {
        fontSize: 16,
        color: theme.error,
        fontWeight: '600',
    },
    autoCheckoutBadge: {
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        // backgroundColor: '#E2E8F0',
        alignSelf: 'flex-start',
    },
    autoCheckoutText: {
        fontSize: 10,
        color: '#475569',
        fontWeight: '600',
    },
});
