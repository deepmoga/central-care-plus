import { StyleSheet, Dimensions, Platform } from 'react-native';
import { ThemeColors } from '../theme/types';

const { width } = Dimensions.get('window');

export const ProfileStyles = (theme: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.surface,
        justifyContent: "center",
        alignSelf: "center",
        marginTop: 60,
        marginBottom: 4,
        borderWidth: 3,
        borderColor: theme.primary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        overflow: "hidden",
        position: "relative",

    },
    profileImage: {
        width: '100%',
        height: '100%',
        position: 'relative',


    },
    cameraIconContainer: {
        position: "absolute",
        bottom: 0,
        right: '35%',
        top: '60%',
        backgroundColor: theme.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: theme.surface,
        // zIndex: 1,
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: theme.surface,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: theme.textSecondary,
    },
    formContainer: {
        backgroundColor: theme.surface,
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: theme.textSecondary,
        marginBottom: 8,
        fontWeight: '600',
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        paddingHorizontal: 15,
        height: 50,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: theme.text,
        fontSize: 16,
    },
    updateButton: {
        backgroundColor: theme.primary,
        borderRadius: 12,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: theme.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
});
