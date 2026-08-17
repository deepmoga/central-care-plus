import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import JobRosterScreen from '../screens/JobRosterScreen';
import WeeklyScreen from '../screens/WeeklyScreen';
import ReportsScreen from '../screens/ReportsScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import JobNotesScreen from '../screens/JobNotesScreen';
import SignatureScreen from '../screens/SignatureScreen';
import LogEmergencyScreen from '../screens/LogEmergencyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ClientProfileScreen from '../screens/ClientProfileScreen';
import PendingSignatureScreen from '../screens/PendingSignatureScreen';
import DocumentScreen from '../screens/DocumentScreen';
import LookListenToolScreen from '../screens/LookListenToolScreen';
import RatingScreen from '../screens/RatingScreen';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActivityIndicatorComponent from '../components/ActivityIndicator';
import { ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export type RootStackParamList = {
    Login: undefined;
    App: undefined;
    JobDetail: { jobId: number, jobTable: string };
    JobRoster: undefined;
    JobNotes: { table_name: string, service_id: number, client_id: number, carer_id: number };
    Signature: { jobId: number, jobTable: string };
    LogEmergency: { jobId?: number, clientName?: string, serviceDate?: string, serviceTime?: string, profile_photo?: string, jobTable?: string, carerId?: number, clientId?: number, is_log_filled: number };
    Profile: { carerId: string | number };
    ClientProfile: {
        clientId?: number;
    };
    PendingSignature: { not_complete_count: number, not_complete_label: string, carerId: any };
    LookListenTool: { clientName: string, serviceId: number, tableName: string, carerId: number, clientId: number, clientAddress?: string, signLastDate?: string };
    Rating: { jobId: number, carerId: number, clientId: number, jobTable: string };

};

export type TabParamList = {
    Dashboard: undefined;
    JobRoster: undefined;
    Weekly: undefined;
    Reports: undefined;
    Profile: undefined;
    Documents: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const AppTabs = () => {
    const { theme, isDark } = useTheme();
    const { role } = useAuthStore();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'help';

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'JobRoster') {
                        iconName = focused ? 'today' : 'today-outline';
                    }
                    else if (role === 'client' && route.name === 'Documents') {
                        iconName = focused ? 'document-text' : 'document-text-outline';
                    }
                    else if (role === 'carer' && route.name === 'Reports') {
                        iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    //  else if (route.name === 'Weekly') {
                    //     iconName = focused ? 'calendar' : 'calendar-outline';
                    // } 

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textTertiary,
                tabBarStyle: {
                    backgroundColor: theme.surface,
                    borderTopColor: theme.border,
                    borderTopWidth: 1,
                    // paddingVertical: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="JobRoster" component={JobRosterScreen} options={{ title: 'Job Roster' }} />
            {/* <Tab.Screen name="Weekly" component={WeeklyScreen} /> */}
            {role === 'carer' && <Tab.Screen name="Reports" component={ReportsScreen} />}
            {role === 'client' && <Tab.Screen name="Documents" component={DocumentScreen} />}
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const RootNavigator = () => {
    const { user, isLoading } = useAuthStore();
    const { theme, isDark } = useTheme();

    // Create custom navigation theme based on app theme
    const navigationTheme = {
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
            ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
            primary: theme.primary,
            background: isDark ? 'green' : "black",
            card: theme.surface,
            text: theme.text,
            border: theme.border,
            notification: theme.primary,
        },
    };


    if (isLoading) {
        return (
            <ActivityIndicatorComponent />
        );
    }

    return (

        <SafeAreaProvider style={{ backgroundColor: theme.background }}>
            <NavigationContainer theme={navigationTheme}>
                <Stack.Navigator screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.background },
                    animation: 'fade',

                }}
                >
                    {user ? (
                        <>
                            <Stack.Screen name="App" component={AppTabs} />
                            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
                            <Stack.Screen name="JobNotes" component={JobNotesScreen} />
                            <Stack.Screen name="Signature" component={SignatureScreen} />
                            <Stack.Screen name="LogEmergency" component={LogEmergencyScreen} />
                            <Stack.Screen name="Profile" component={ProfileScreen} />
                            <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />
                            <Stack.Screen name="PendingSignature" component={PendingSignatureScreen} />
                            <Stack.Screen name="LookListenTool" component={LookListenToolScreen} />
                            <Stack.Screen name="Rating" component={RatingScreen} />
                            {/* <Stack.Screen name="Document" component={DocumentScreen} /> */}
                        </>
                    ) : (
                        <Stack.Screen name="Login" component={LoginScreen} />
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
};

export default RootNavigator;

