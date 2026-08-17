import { StyleSheet } from 'react-native';
import { ThemeColors } from '../theme/types';

export const createStyles = (theme: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    content: {
        width: '100%',
        maxWidth: 450,
        alignSelf: 'center',
    },
    iconContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        position: 'relative',
        marginBottom: 4,
    },


    // Illustration
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    illustration: {
        width: '100%',
        height: 200,
    },

    // Logos
    logosContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        gap: 16,
    },
    haiseyLogo: {
        width: 140,
        height: 60,
    },
    careMadeEasyLogo: {
        width: 140,
        height: 60,
    },

    // Card
    card: {
        backgroundColor: theme.card,
        borderRadius: 16,
        padding: 24,
        shadowColor: theme.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: theme.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },

    // Input Fields
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: theme.textSecondary,
        // marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        backgroundColor: theme.inputBackground,
        color: theme.inputText,
    },
    inputError: {
        borderColor: theme.error,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        backgroundColor: theme.inputBackground,
    },
    passwordInput: {
        flex: 1,
        padding: 12,
        fontSize: 14,
        color: theme.inputText,
    },
    eyeIcon: {
        padding: 12,
    },
    errorText: {
        color: theme.error,
        fontSize: 12,
        marginTop: 4,
    },

    // Button
    button: {
        backgroundColor: theme.primary,
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: theme.primaryText,
        fontSize: 16,
        fontWeight: '600',
    },
});
