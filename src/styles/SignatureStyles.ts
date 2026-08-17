import { StyleSheet, Dimensions } from 'react-native';
import { ThemeColors } from '../theme/types';

const { width } = Dimensions.get('window');

export const createStyles = (theme: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        backgroundColor: theme.surface,
        borderRadius: 24,
        padding: 24,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        textAlign: 'center',
        marginBottom: 24,
    },
    instructionText: {
        fontSize: 14,
        color: theme.textSecondary,
        marginBottom: 16,
        textAlign: 'center',
    },
    signatureBox: {
        width: '100%',
        height: 250,
        borderWidth: 2,
        borderColor: theme.border,
        borderStyle: 'dashed',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#FAFAFA', // Light background for signature area
        position: 'relative',
    },
    penIcon: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 10,
        opacity: 0.5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 24,
        gap: 16,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.error,
    },
    clearButtonText: {
        color: theme.error,
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: theme.primary,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
