import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '../context/ThemeContext';

interface UpdateResponse {
    success: boolean;
    latest_version: string;
    force_update: boolean;
    store_url?: string;
    store_url_ios?: string;
    store_url_android?: string;
}

const UpdateModal = () => {
    const { theme } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updateData, setUpdateData] = useState<UpdateResponse | null>(null);

    // Get current app version from app.json via Constants
    const currentVersion = Constants.expoConfig?.version || '1.0.0';

    useEffect(() => {
        checkForUpdate();
    }, []);

    const compareVersions = (v1: string, v2: string) => {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const num1 = parts1[i] || 0;
            const num2 = parts2[i] || 0;
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        return 0;
    };

    const checkForUpdate = async () => {
        try {
            // Replace this with your actual API endpoint URL
            const response = await fetch('https://homecareclaimportal.com.au/api/check_app_version.php');
            
            if (response.ok) {
                const data: UpdateResponse = await response.json();
                
                if (data && data.success && data.latest_version) {
                    setUpdateData(data);
                    
                    // If the latest version from API is greater than current version
                    if (compareVersions(data.latest_version, currentVersion) > 0) {
                        setIsVisible(true);
                    }
                }
            }
        } catch (error) {
            console.log('Error checking for updates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = () => {
        if (!updateData) return;

        let url = updateData.store_url;

        // Fallback to platform specific URLs if provided
        if (Platform.OS === 'ios' && updateData.store_url_ios) {
            url = updateData.store_url_ios;
        } else if (Platform.OS === 'android' && updateData.store_url_android) {
            url = updateData.store_url_android;
        }

        if (url) {
            Linking.canOpenURL(url).then(supported => {
                if (supported) {
                    Linking.openURL(url!);
                } else {
                    console.log("Don't know how to open URI: " + url);
                }
            });
        }
    };

    const handleDismiss = () => {
        // Only allow dismissing if it's not a forced update
        if (updateData && !updateData.force_update) {
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={handleDismiss}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
                    
                    <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                        <Ionicons name="cloud-download" size={40} color={theme.primary} />
                    </View>

                    <Text style={[styles.title, { color: theme.text }]}>New Update Available!</Text>
                    
                    <Text style={[styles.description, { color: theme.textSecondary }]}>
                        A new version ({updateData?.latest_version}) of the Central Care app is available. Please update to get the latest features and improvements.
                    </Text>

                    <TouchableOpacity 
                        style={[styles.updateButton, { backgroundColor: theme.primary }]} 
                        onPress={handleUpdate}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.updateButtonText}>Update Now</Text>
                    </TouchableOpacity>

                    {updateData && !updateData.force_update && (
                        <TouchableOpacity 
                            style={styles.dismissButton} 
                            onPress={handleDismiss}
                        >
                            <Text style={[styles.dismissButtonText, { color: theme.textSecondary }]}>Maybe Later</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 30,
    },
    updateButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dismissButton: {
        paddingVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    dismissButtonText: {
        fontSize: 15,
        fontWeight: '600',
    }
});

export default UpdateModal;
