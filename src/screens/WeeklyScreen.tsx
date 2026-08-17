import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyles } from '../styles/WeeklyStyles';
import { useTheme } from '../context/ThemeContext';

const WeeklyScreen = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Weekly</Text>
                <Text style={styles.subtitle}>Weekly schedule will appear here.</Text>
            </View>
        </SafeAreaView>
    );
};



export default WeeklyScreen;
