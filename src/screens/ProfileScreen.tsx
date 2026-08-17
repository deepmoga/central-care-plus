import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ProfileStyles } from '../styles/ProfileStyles';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { getUserProfile, updateClientProfile, updateUserProfile } from '../api/user.service';
import { getClientProfile } from '../api/user.service';
import { useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

interface UserProfile {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone: string;
    mobile: string;
    profile_photo: string | null;
    dob: string | null;
    address: string | null;
}

const ProfileSchema = Yup.object().shape({
    first_name: Yup.string(),
    last_name: Yup.string(),
    email: Yup.string().email('Invalid email'),
    phone: Yup.string().min(10).max(10),
    mobile: Yup.string().min(10).max(10),
    dob: Yup.string(),
    address: Yup.string(),
});

const ProfileScreen = () => {
    const { theme } = useTheme();
    const styles = ProfileStyles(theme);
    const [isLoading, setIsLoading] = useState(false);
    const { user, setUser, role } = useAuthStore();
    const [initialValues, setInitialValues] = useState<UserProfile>({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        phone: "",
        mobile: "",
        profile_photo: null,
        dob: "",
        address: ""
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const getUserDetails = async (userId: number) => {
        try {
            const apiCall = role === 'client' ? getClientProfile : getUserProfile;
            const response = await apiCall(userId);
            if (response.data) {
                setInitialValues({
                    first_name: response.data.first_name,
                    last_name: response.data.last_name,
                    username: response.data.username,
                    email: response.data.email,
                    phone: response.data.phone,
                    mobile: response.data.mobile,
                    profile_photo: response.data.profile_photo || null,
                    dob: response.data.dob ? response.data.dob.split('-').reverse().join('-') : "",
                    address: response.data.address
                });

                // Update global store to reflect changes immediately
                if (user) {
                    setUser({
                        ...user,
                        ...response.data,
                        user_name: response.data.username || user.user_name,
                        profile_photo: response.data.profile_photo || user.profile_photo
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    useEffect(() => {
        if (user?.id) {
            getUserDetails(user.id);
        }
    }, [user?.id]);

    //  const pickImage = async () => {
    //         if (images.length >= 3) {
    //             Alert.alert("Limit Reached", "You can only upload up to 3 images.");
    //             return;
    //         }

    //         const options = [
    //             { text: 'Take Photo', onPress: openCamera },
    //             { text: 'Choose from Gallery', onPress: openGallery },
    //             { text: 'Cancel', style: 'cancel' }
    //         ];

    //         Alert.alert('Add Image', 'Choose an option', options as any);
    //     };

    const pickImage = async (setFieldValue: (field: string, value: any) => void) => {
        const options = [
            { text: 'Take Photo', onPress: () => openCamera() },
            { text: 'Choose from Gallery', onPress: () => openGallery() },
            { text: 'Cancel', style: 'cancel' }
        ];

        Alert.alert('Update Profile Photo', 'Choose an option', options as any);
    };

    const openCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "You've refused to allow this app to access your camera!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            // allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const openGallery = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleUpdate = async (values: UserProfile) => {
        if (!user?.id) return;
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('first_name', values.first_name);
            formData.append('last_name', values.last_name);
            formData.append('email', values.email);
            formData.append('phone', values.phone);
            formData.append('mobile', values.mobile);

            let apiDob = values.dob || '';
            if (apiDob) {
                const [day, month, year] = apiDob.split('-');
                apiDob = `${year}-${month}-${day}`;
            }
            formData.append('dob', apiDob);

            formData.append('address', values.address || '');
            // formData.append('username', values.username); // Usually username is not editable or sent separately

            if (selectedImage) {
                const filename = selectedImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('profile_photo', {
                    uri: selectedImage,
                    name: filename,
                    type,
                } as any);
            }
            const apiUpdateCall = role === 'client' ? updateClientProfile : updateUserProfile;
            const response = await apiUpdateCall(user?.id, formData);
            if (response.status === 'success' || response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Profile Updated',
                    text2: 'Your profile has been updated successfully.',
                    position: 'top',
                });
                // Refresh data
                getUserDetails(user.id);
                setSelectedImage(null);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Update Failed',
                    text2: response.message || 'Could not update profile.',
                    position: 'top',
                });
            }

        } catch (error) {
            console.error("Error updating profile:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An unexpected error occurred.',
                position: 'top',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (text: string) => {
        // Remove non-numeric characters
        const cleaned = text.replace(/[^0-9]/g, '');
        let formatted = cleaned;

        // Add hyphens: DD-MM-YYYY
        if (cleaned.length > 2) {
            formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
        }
        if (cleaned.length > 4) {
            formatted = `${formatted.slice(0, 5)}-${cleaned.slice(4)}`;
        }

        return formatted.slice(0, 10); // DD-MM-YYYY
    };


    const parseDate = (dateString: string) => {
        if (!dateString) return new Date();
        const [day, month, year] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const handleDateChange = (event: any, selectedDate?: Date, setFieldValue?: any) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (event.type === 'dismissed') return;

        if (selectedDate && setFieldValue) {
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear();
            const dateString = `${day}-${month}-${year}`;
            setFieldValue('dob', dateString);
        }
    };

    const renderInput = (
        handleChange: { (e: React.ChangeEvent<any>): void; <T = string | React.ChangeEvent<any>>(field: T): T extends React.ChangeEvent<any> ? void : (e: string | React.ChangeEvent<any>) => void; },
        handleBlur: { (e: React.FocusEvent<any, Element>): void; <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void; },
        values: UserProfile,
        errors: any,
        touched: any,
        label: string,
        key: keyof UserProfile,
        icon: keyof typeof Ionicons.glyphMap,
        placeholder: string,
        keyboardType: 'default' | 'email-address' | 'phone-pad' | 'numeric' = 'default',
        multiline: boolean = false,
        maxLength?: number,
        disabled: boolean = false,
        customOnChange?: (text: string) => void,
        isDate?: boolean,
        setFieldValue?: any,

    ) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={[
                styles.inputContainer,
                multiline && { height: 100, alignItems: 'flex-start', paddingTop: 15 },
                touched[key] && errors[key] ? { borderColor: theme.error } : null
            ]}>
                <Ionicons name={icon} size={20} color={theme.textTertiary} style={[styles.inputIcon, multiline && { marginTop: 0 }]} />
                {isDate ? (
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={[styles.input, { paddingTop: 14, color: values[key] ? theme.text : theme.textTertiary }]}>
                            {values[key] ? values[key] : placeholder}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TextInput
                        style={[styles.input, multiline && { textAlignVertical: 'top' }]}
                        value={values[key] || ''}
                        onChangeText={customOnChange || handleChange(key)}
                        onBlur={handleBlur(key)}
                        placeholder={placeholder}
                        placeholderTextColor={theme.textTertiary}
                        keyboardType={keyboardType}
                        multiline={multiline}
                        maxLength={maxLength}
                        readOnly={disabled}
                    />
                )}
            </View>
            {touched[key] && errors[key] && (
                <Text style={{ color: theme.error, fontSize: 12, marginLeft: 4, marginTop: 4 }}>{errors[key]}</Text>
            )}
            {isDate && showDatePicker && (
                <View>
                    <DateTimePicker
                        value={values[key] ? parseDate(values[key] as string) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => handleDateChange(event, date, setFieldValue)}
                        maximumDate={new Date()}
                    />
                    {Platform.OS === 'ios' && (
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            style={{
                                backgroundColor: theme.surface,
                                padding: 10,
                                alignItems: 'center',
                                borderTopWidth: 1,
                                borderTopColor: theme.border
                            }}
                        >
                            <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 16 }}>Done</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );

    return (
        <LinearGradient colors={theme.backgroundGradient as [string, string, ...string[]]} style={{ flex: 1 }}>
            <View style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={ProfileSchema}
                        onSubmit={handleUpdate}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                            <>
                                {/* Header Section */}
                                <View style={styles.header}>

                                    <TouchableOpacity
                                        style={styles.profileImageContainer}
                                        onPress={() => pickImage(setFieldValue)}
                                    >
                                        {selectedImage ? (
                                            <Image
                                                source={{ uri: selectedImage }}
                                                style={styles.profileImage}
                                                resizeMode="cover"
                                            />
                                        ) : values.profile_photo ? (
                                            <Image
                                                source={{ uri: `${process.env.EXPO_PUBLIC_BASE_URL}${values.profile_photo}` }}
                                                style={styles.profileImage}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={styles.placeholderImage}>
                                                <Ionicons name="person" size={60} color={theme.textTertiary} />
                                            </View>
                                        )}


                                    </TouchableOpacity>
                                    <View style={styles.cameraIconContainer}>
                                        <Ionicons name="camera" size={20} color="#fff" />
                                    </View>
                                    <Text style={styles.userName}>{values.first_name} {values.last_name}</Text>
                                    <Text style={styles.userEmail}>{values.email}</Text>
                                </View>

                                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                                    {/* Form Section */}
                                    <View style={styles.formContainer}>
                                        {renderInput(handleChange, handleBlur, values, errors, touched, "First Name", "first_name", "person-outline", "Enter first name", 'default', false, 20, true)}
                                        {renderInput(handleChange, handleBlur, values, errors, touched, "Last Name", "last_name", "person-outline", "Enter last name", 'default', false, 20, true)}
                                        {renderInput(handleChange, handleBlur, values, errors, touched, "Email", "email", "mail-outline", "Enter email", "email-address")}
                                        {renderInput(handleChange, handleBlur, values, errors, touched, "Phone", "phone", "call-outline", "Enter phone number", "phone-pad", false, 10,)}
                                        {renderInput(handleChange, handleBlur, values, errors, touched, "Mobile", "mobile", "phone-portrait-outline", "Enter mobile number", "phone-pad", false, 10)}
                                        {renderInput(
                                            handleChange,
                                            handleBlur,
                                            values,
                                            errors,
                                            touched,
                                            "Date of Birth",
                                            "dob",
                                            "calendar-outline",
                                            "DD-MM-YYYY",
                                            "numeric",
                                            false,
                                            10,
                                            false,
                                            (text) => setFieldValue('dob', formatDate(text)),
                                            true,
                                            setFieldValue
                                        )}
                                        {renderInput(handleChange, handleBlur, values, errors, touched, "Address", "address", "location-outline", "Enter address", "default", true)}

                                        <TouchableOpacity
                                            style={[styles.updateButton, isLoading && styles.disabledButton]}
                                            onPress={() => handleSubmit()}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            ) : (
                                                <Text style={styles.updateButtonText}>Update Profile</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            </>
                        )}
                    </Formik>
                </KeyboardAvoidingView>
            </View>
        </LinearGradient>
    );
};

export default ProfileScreen;
