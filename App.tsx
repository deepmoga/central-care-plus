import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import { useEffect } from 'react';
import { getToastConfig } from './src/config/ToastConfig';
import UpdateModal from './src/components/UpdateModal';


import * as Notifications from 'expo-notifications';
import { syncPushTokenWithBackend } from './src/utils/notification.utils';

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

        // Register and sync push notifications token
        syncPushTokenWithBackend();

        // Notification listener for foreground notifications
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('Push notification received in foreground:', notification);
        });

        // Notification response listener (when user taps notification)
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('User interacted with notification:', response);
        });

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, []);

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <RootNavigator />
                <StatusBar style="auto" />
                <ThemedToast />
                <UpdateModal />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
