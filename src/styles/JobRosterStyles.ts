import { StyleSheet } from 'react-native';
import { ThemeColors } from '../theme/types';

export const createStyles = (theme: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 12,
        // paddingHorizontal: 10,
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
    content: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    sectionHeader: {
        paddingVertical: 12,
        // backgroundColor: theme.background,
        marginBottom: 8,
        borderRadius: 12,
    },
    sectionHeaderText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.text,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background
    },
    noJobsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    noJobsText: {
        fontSize: 16,
        color: theme.textSecondary,
    },

});
