import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import { useEffect } from 'react';
import { getToastConfig } from './src/config/ToastConfig';


const ThemedToast = () => {
    const { theme } = useTheme();

    return <Toast config={getToastConfig(theme)} />;
};

export default function App() {
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({
                    type: 'info',
                    text1: 'Permission denied',
                    text2: 'Location permission is required for some features',
                    position: 'top',
                });
            }
        })();
    }, []);

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <RootNavigator />
                <StatusBar style="auto" />
                <ThemedToast />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
