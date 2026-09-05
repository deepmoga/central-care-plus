import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { savePushToken } from '../api/user.service';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
    let token: string | null = null;
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#18a157',
            sound: 'default',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token: permission not granted');
            return null;
        }

        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId ??
                '1bcf4e02-9907-4887-bdaa-eb4007640cbd';

            const pushTokenData = await Notifications.getExpoPushTokenAsync({
                projectId,
            });
            token = pushTokenData?.data || null;
            console.log('Obtained Expo push token:', token);
        } catch (e) {
            console.error('Error getting Expo push token:', e);
        }
    } else {
        console.log('Physical device required for Push Notifications');
    }

    return token;
}

export async function syncPushTokenWithBackend(): Promise<string | null> {
    try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
            await savePushToken(token);
            console.log('Push token successfully synced to backend:', token);
            return token;
        }
    } catch (err) {
        console.error('Error syncing push token with backend:', err);
    }
    return null;
}

export async function scheduleCheckoutReminder(jobId: number, serviceDate: string, serviceEndTime: string) {
    const notificationIds: string[] = [];

    // Helper to convert 12h format to 24h format
    const convertTo24Hour = (timeStr: string) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');

        if (hours === '12') {
            hours = '00';
        }

        if (modifier === 'PM') {
            hours = (parseInt(hours, 10) + 12).toString();
        }

        return `${hours}:${minutes}`;
    };

    // Parse service end time
    // serviceDate is YYYY-MM-DD, serviceEndTime is HH:mm AM/PM
    let formattedEndTime = serviceEndTime;
    if (serviceEndTime.includes('AM') || serviceEndTime.includes('PM')) {
        formattedEndTime = convertTo24Hour(serviceEndTime);
    }

    const endTimeString = `${serviceDate}T${formattedEndTime}:00`;
    const endTime = new Date(endTimeString);

    // 1. 10 minutes before end time
    const tenMinutesBefore = new Date(endTime.getTime() - 10.5 * 60 * 1000);

    // Only schedule if time is in the future
    if (tenMinutesBefore.getTime() > Date.now()) {
        try {
            const id1 = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Checkout Reminder",
                    body: "Your job is ending in 10 minutes. Don't forget to checkout!",
                    data: { jobId },
                    channelId: 'default',
                } as any,
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: tenMinutesBefore,
                },
            });
            notificationIds.push(id1);
        } catch (e) {
            console.error("Error scheduling 10 min reminder:", e);
        }
    } else {
        console.log("Skipping 10 min reminder (time in past)");
    }

    // 2. 2 hours after end time
    const twoHoursAfter = new Date(endTime.getTime() + 2 * 60 * 60 * 1000);

    if (twoHoursAfter.getTime() > Date.now()) {
        try {
            const id2 = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Missed Checkout?",
                    body: "It's been 2 minutes since your job ended. Please checkout if you haven't already.",
                    data: { jobId },
                    channelId: 'default',
                } as any,
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: twoHoursAfter,
                },
            });
            notificationIds.push(id2);
        } catch (e) {
            console.error("Error scheduling 2 minute reminder:", e);
        }
    } else {
        console.log("Skipping 2 minute reminder (time in past)");
    }

    return notificationIds;
}

export async function cancelJobNotifications(notificationIds: string[]) {
    for (const id of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
    }
}
