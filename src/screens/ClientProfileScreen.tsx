import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Linking,
    RefreshControl
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ProfileStyles } from '../styles/ProfileStyles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { getClientProfile, getUserProfile } from '../api/user.service';

interface ClientProfileData {
    client_name: string;
    family_name: string;
    email: string;
    phone: string;
    mobile?: string;
    profile_photo: string | null;
    dob?: string | null;
    address: string | null;
    username?: string;
    client_documents?: { doc_name: string; doc_file: string }[];
}

interface ClientProfileParams {
    clientId: number;
}

const ClientProfileScreen = () => {
    const { theme } = useTheme();
    const styles = ProfileStyles(theme);
    const route = useRoute();
    const navigation = useNavigation();
    const { role } = useAuthStore();

    // Get params from navigation
    const params = route.params as ClientProfileParams;

    const [profileData, setProfileData] = React.useState<ClientProfileData | null>(null);
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        if (role === 'client') {
            await getCarerProfile(params.clientId);
        } else {
            await getClientDetails(params.clientId);
        }
        setRefreshing(false);
    }, [params.clientId, role]);

    const getClientDetails = async (id: number) => {
        try {
            const response = await getClientProfile(id);
            if (response.success && response.data) {
                setProfileData(response.data);
            } else if (response.client_name) {
                // Fallback if response is directly the data
                setProfileData(response);
            }
            else {
                // Try to set response directly if structure matches
                setProfileData(response.data || response);
            }
        } catch (error) {
            console.log("API Error:", error);
        }
    }

    const getCarerProfile = async (id: number) => {
        try {
            const response = await getUserProfile(id);

            let carerData = null;
            if (response.success && response.data) {
                carerData = response.data;
            } else {
                carerData = response;
            }

            if (carerData) {
                setProfileData({
                    client_name: carerData.first_name || '',
                    family_name: carerData.last_name || '',
                    email: carerData.email || '',
                    phone: carerData.phone || '',
                    mobile: carerData.mobile || '',
                    profile_photo: carerData.profile_photo,
                    dob: carerData.dob,
                    address: carerData.address,
                    username: carerData.username,
                    client_documents: []
                });
            }
        } catch (error) {
            console.log("API Error:", error);
        }
    }

    const fullName = profileData ? `${profileData.client_name} ${profileData.family_name}`.trim() : '';

    useEffect(() => {
        if (role === 'client') {
            getCarerProfile(params.clientId);
        } else {
            getClientDetails(params.clientId);
        }
    }, [params.clientId, role])

    const formatDOB = (dob?: string | null) => {
        if (!dob) return null;
        const [year, month, day] = dob.split("-");
        return `${day}-${month}-${year}`;
    };

    const renderDetailRow = (
        label: string,
        value: string | null | undefined,
        icon: keyof typeof Ionicons.glyphMap,
        isLast: boolean = false
    ) => {
        // if (!value) return null; // Removed to show static fields

        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: theme.border
            }}>
                <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.background,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16
                }}>
                    <Ionicons name={icon} size={20} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: theme.textTertiary, marginBottom: 4 }}>{label}</Text>
                    <Text style={{ fontSize: 16, color: theme.text, fontWeight: '500' }}>{value || '--'}</Text>
                </View>
            </View>
        );
    };

    return (
        <LinearGradient colors={theme.backgroundGradient as [string, string, ...string[]]} style={{ flex: 1 }}>
            <View style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent} 
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
                        }
                    >

                        {/* Header Section */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={{ position: 'absolute', left: 10, top: 40, padding: 10, zIndex: 10 }}
                                onPress={() => navigation.goBack()}
                            >
                                <Ionicons name="arrow-back" size={24} color={theme.text} />
                            </TouchableOpacity>

                            <View style={[styles.profileImageContainer, { marginTop: 60 }]}>
                                {profileData?.profile_photo ? (
                                    <Image
                                        source={{ uri: `${process.env.EXPO_PUBLIC_BASE_URL}${profileData.profile_photo}` }}
                                        style={styles.profileImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.placeholderImage}>
                                        <Ionicons name="person" size={60} color={theme.textTertiary} />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.userName}>{fullName}</Text>
                            {profileData?.email && <Text style={styles.userEmail}>{profileData.email}</Text>}
                        </View>

                        {/* Details Section */}
                        <View style={{
                            backgroundColor: theme.surface,
                            marginHorizontal: 10,
                            marginTop: 10,
                            borderRadius: 20,
                            padding: 10,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            elevation: 5
                        }}>
                            {renderDetailRow("Full Name", fullName, "person-outline")}
                            {renderDetailRow("Email", profileData?.email, "mail-outline")}
                            {renderDetailRow("Phone", profileData?.phone, "call-outline")}
                            {renderDetailRow("Mobile", profileData?.mobile, "phone-portrait-outline")}
                            {renderDetailRow("Date of Birth", formatDOB(profileData?.dob), "calendar-outline")}
                            {renderDetailRow("Address", profileData?.address, "location-outline")}
                            {/* {renderDetailRow("Username", profileData?.username, "at-outline", true)} */}
                        </View>

                        {/* Documents Section */}
                        {profileData?.client_documents && profileData.client_documents.length > 0 && (
                            <View style={{
                                backgroundColor: theme.surface,
                                marginHorizontal: 10,
                                marginTop: 10,
                                borderRadius: 20,
                                padding: 10,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 5,
                                marginBottom: 20
                            }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: theme.text,
                                    marginBottom: 10,
                                    marginLeft: 10,
                                    marginTop: 5
                                }}>
                                    Documents
                                </Text>
                                {profileData.client_documents.map((doc, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingVertical: 12,
                                            borderBottomWidth: index === profileData.client_documents!.length - 1 ? 0 : 1,
                                            borderBottomColor: theme.border
                                        }}
                                        onPress={() => {
                                            const url = doc.doc_file;
                                            Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
                                        }}
                                    >
                                        <View style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            backgroundColor: '#FFEBEE', // Light red for PDF
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 16
                                        }}>
                                            <Ionicons name="document-text" size={20} color="#D32F2F" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 14, color: theme.text, fontWeight: '500' }}>{doc.doc_name}</Text>
                                            <Text style={{ fontSize: 12, color: theme.textTertiary }}>Tap to view PDF</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </LinearGradient>
    );
};

export default ClientProfileScreen;
