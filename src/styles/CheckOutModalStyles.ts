import { StyleSheet } from 'react-native';
import { ThemeColors } from '../theme/types';

export const createStyles = (theme: ThemeColors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: theme.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.text,
    },
    timeSection: {
        backgroundColor: theme.background,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        alignItems: 'center',
    },
    label: {
        color: theme.textSecondary,
        fontSize: 14,
    },
    value: {
        color: theme.text,
        fontSize: 16,
        fontWeight: '600',
    },
    strikethrough: {
        textDecorationLine: 'line-through',
        color: theme.textTertiary,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: theme.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkboxChecked: {
        backgroundColor: theme.primary,
    },
    checkboxLabel: {
        color: theme.text,
        fontSize: 16,
        fontWeight: '500',
    },
    summarySection: {
        backgroundColor: theme.background,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    confirmButton: {
        backgroundColor: theme.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});