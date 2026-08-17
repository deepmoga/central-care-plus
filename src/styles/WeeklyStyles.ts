import { StyleSheet } from "react-native";
import { ThemeColors } from '../theme/types';

export const createStyles = (theme: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.card,
        margin: 20,
        borderRadius: 16,
        shadowColor: theme.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: theme.text,
    },
    subtitle: {
        fontSize: 16,
        color: theme.textSecondary,
    },
});