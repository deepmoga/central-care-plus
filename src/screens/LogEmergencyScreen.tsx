import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActionSheetIOS, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/LogEmergencyStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { logEmergency, getEmergencyLogs } from '../api/jobs.service';
import Toast from 'react-native-toast-message';

const LogEmergencyScreen = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const navigation = useNavigation();
    const route = useRoute();

    // Optional params if navigating from a job
    const { jobId, clientName, serviceDate, serviceTime, profile_photo, jobTable, carerId, clientId, is_log_filled } = route.params as any || {};

    const [eventType, setEventType] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [fetchedImages, setFetchedImages] = useState<any>({});
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (is_log_filled === 1) {
            fetchLogData();
        }
    }, [is_log_filled]);

    const fetchLogData = async () => {
        setLoadingData(true);
        try {
            const response = await getEmergencyLogs(jobId, jobTable);
            if (response.success && response.data) {
                const data = response.data[0];
                setEventType(data.event_type);
                setDescription(data.description);
                if (data) {
                    const images = Object.keys(data)
                        .filter(key => key.startsWith('image'))
                        .map(key => data[key])
                        .filter(Boolean)
                        .map(path => `${process.env.EXPO_PUBLIC_BASE_URL}${path}`);
                    setFetchedImages(images);
                }
            }
        } catch (error) {
            console.error("Failed to fetch log data", error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load existing log.' });
        } finally {
            setLoadingData(false);
        }
    };

    const pickImage = async () => {
        if (images.length >= 3) {
            Alert.alert("Limit Reached", "You can only upload up to 3 images.");
            return;
        }

        const options = [
            { text: 'Take Photo', onPress: openCamera },
            { text: 'Choose from Gallery', onPress: openGallery },
            { text: 'Cancel', style: 'cancel' }
        ];

        Alert.alert('Add Image', 'Choose an option', options as any);
    };

    const openCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "You've refused to allow this app to access your camera!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    const openGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "You've refused to allow this app to access your photos!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            // aspect: [3, 2],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const [submitting, setSubmitting] = useState(false);
    const handleLogEvent = async () => {
        if (!eventType.trim()) {
            Toast.show({ type: 'error', text1: 'Missing Information', text2: 'Please enter an Event Type.' });
            return;
        }
        if (!description.trim()) {
            Toast.show({ type: 'error', text1: 'Missing Information', text2: 'Please enter a Description.' });
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('carer_id', carerId);
        formData.append('client_id', clientId);
        formData.append('id', jobId);
        formData.append('table', jobTable);
        formData.append('event_type', eventType);
        formData.append('description', description);

        images.forEach((uri, index) => {
            const filename = uri.split('/').pop() || `image_${index}.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('images[]', {
                uri,
                name: filename,
                type,
            } as any);
        });

        try {
            const response = await logEmergency(formData);
            if (response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Event Logged',
                    text2: 'Your report has been submitted successfully.',
                });
                setTimeout(() => {
                    navigation.goBack();
                }, 1500);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Submission Failed',
                    text2: response.message || 'Failed to log event.',
                });
            }
        } catch (error) {
            console.error("Error logging emergency:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An error occurred while submitting the log.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <LinearGradient colors={theme.backgroundGradient as [string, string, ...string[]]} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Log Emergency / Incident</Text>
                    </View>
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>

                    {/* Warning Banner */}
                    <View style={styles.warningBanner}>
                        <Ionicons name="warning" size={24} color="#D32F2F" style={styles.warningIcon} />
                        <View style={styles.warningTextContainer}>
                            <Text style={styles.warningTitle}>Report any emergency or incident.</Text>
                            {/* <Text style={styles.warningText}>This will be reviewed by your supervisor.</Text> */}
                        </View>
                    </View>

                    {/* Job/Client Card (Optional) */}
                    {clientName && (
                        <View style={styles.card}>
                            <View style={styles.clientRow}>
                                <View style={styles.avatar}>
                                    {profile_photo ? (
                                        <Image source={{ uri: `${process.env.EXPO_PUBLIC_BASE_URL}${profile_photo}` }}
                                            style={{ width: 32, height: 32, borderRadius: 16 }}
                                        />
                                    ) : (<Ionicons name="person" size={24} color={theme.textSecondary} />)}

                                </View>
                                <View style={styles.clientInfo}>
                                    <Text style={styles.clientName}>{clientName}</Text>
                                    <Text style={styles.agencyName}>Client</Text>
                                </View>
                                {/* <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} /> */}
                            </View>
                            {(serviceDate || serviceTime) && (
                                <View style={styles.timeRow}>
                                    <Feather name="calendar" size={16} color={theme.textSecondary} />
                                    <Text style={styles.timeText}>
                                        {serviceDate} {serviceTime ? `- ${serviceTime}` : ''}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Link to visit (Mock) */}
                    {/* <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.sectionTitle}>Link to visit</Text>
                            <Text style={[styles.optionalText, { marginLeft: 8 }]}> (optional)</Text>
                        </View>
                        <TouchableOpacity style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="calendar" size={16} color={theme.text} style={{ marginRight: 8 }} />
                                <Text style={{ color: theme.text }}>3:28 PM</Text>
                            </View>
                            <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View> */}

                    {/* Event Type */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.sectionTitle}>Event Type<Text style={{ color: '#ff3434ff' }}>*</Text></Text>
                            {/* <View style={styles.requiredBadge}>
                                <Text style={styles.requiredText}>Required</Text>
                            </View> */}
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Client Fall"
                            placeholderTextColor={theme.textTertiary}
                            value={eventType}
                            onChangeText={setEventType}
                            readOnly={is_log_filled === 1}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.sectionTitle}>Description<Text style={{ color: '#ff3434ff' }}>*</Text></Text>
                            {/* <Text style={[styles.optionalText, { marginLeft: 8 }]}> (required)</Text> */}
                            {/* <View style={[styles.requiredBadge, { marginLeft: 'auto' }]}>
                                <Text style={styles.requiredText}>Required</Text>
                            </View> */}
                        </View>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Please describe what happened..."
                            placeholderTextColor={theme.textTertiary}
                            multiline
                            value={description}
                            onChangeText={setDescription}
                            readOnly={is_log_filled === 1}
                        />
                    </View>

                    {/* Image Upload */}
                    <View style={styles.imageSection}>
                        <Text style={styles.sectionTitle}>Attachments {is_log_filled !== 1 && "(Max 3)"}</Text>

                        {is_log_filled !== 1 && images.length < 3 && (
                            <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
                                <Ionicons name="camera-outline" size={24} color={theme.primary} />
                                <Text style={styles.imageUploadText}>Add Image</Text>
                            </TouchableOpacity>
                        )}
                        {loadingData ? (
                            <ActivityIndicator size="small" color={theme.primary} />
                        ) : (
                            <View style={styles.imagesContainer}>
                                {is_log_filled === 1 ? (
                                    fetchedImages.length > 0 ? (
                                        fetchedImages.map((img: any, index: number) => (
                                            <View key={index} style={styles.fetchedImageWrapper}>
                                                <Image source={{ uri: `${img}` }} style={styles.thumbnail} resizeMode='contain' />
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={{ color: theme.textSecondary, fontStyle: 'italic', marginTop: 8 }}>No images captured for this event</Text>
                                    )
                                ) : (
                                    images.map((uri, index) => (
                                        <View key={index} style={styles.imageWrapper}>
                                            <Image source={{ uri }} style={styles.thumbnail} />
                                            <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                                                <Ionicons name="close" size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                )}
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Action Buttons */}
                {is_log_filled === 1 ? null : (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.submitButton} onPress={handleLogEvent} disabled={submitting}>
                            {submitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Log Event</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}


            </SafeAreaView>
        </LinearGradient>
    );
};

export default LogEmergencyScreen;
