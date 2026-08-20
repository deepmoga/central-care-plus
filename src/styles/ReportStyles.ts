import { StyleSheet } from "react-native";
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
        padding: 12,
        backgroundColor: theme.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 16,
    },

    statsContainer: {
        paddingHorizontal: 24,
        gap: 10,
        marginTop: 16,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: theme.card,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 12,
        color: theme.textSecondary,
        fontWeight: '500',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.text,
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: theme.border,
        marginHorizontal: 16,
    },
    subStatContainer: {
        flex: 1,
    },
    subStatLabel: {
        fontSize: 12,
        color: theme.textSecondary,
        fontWeight: '500',
        marginBottom: 4,
    },
    subStatValue: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
    },
    emergencyCard: {
        flex: 1,
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 16,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    warningIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFF5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,

    },
    serviceStatusContainer: {
        flexDirection: 'column',
        gap: 8,
        marginTop: 12,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        width: '100%',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 12,
        color: '#fff',
        textAlign: 'left'
    },
});
