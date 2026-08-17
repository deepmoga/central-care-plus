import { StyleSheet } from 'react-native';
import { ThemeColors } from '../theme/types';

export const createStyles = (theme: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor is handled by LinearGradient in the screen
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        marginTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.card,
        borderRadius: 12,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.text,
        letterSpacing: 0.5,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 16,
        color: theme.textSecondary,
        textAlign: 'center',
        marginTop: 16,
    },
});
