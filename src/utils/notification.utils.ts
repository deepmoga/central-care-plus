import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
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
            Alert.alert('Permission required', 'Failed to get push token for push notification!');
            return;
        }
    } else {
        Alert.alert('Physical device required', 'Must use physical device for Push Notifications');
        console.log("Not a physical device");
    }
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
