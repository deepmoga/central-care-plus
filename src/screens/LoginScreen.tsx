import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { createStyles } from '../styles/LoginStyles';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import ActivityIndicatorComponent from '../components/ActivityIndicator';

const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .required('Required'),
    password: Yup.string()
        .required('Required'),
});

interface LoginValues {
    email: string;
    password: string;
}

const whiteScreenLogo = require("../../assets/whiteScreenLogo.png");
const blackScreenLogo = require("../../assets/blackScreenLogo.png");


const LoginScreen = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const { signIn, isLoading } = useAuthStore();
    const { theme, isDark } = useTheme();
    const styles = createStyles(theme);

    const handleLogin = async (values: LoginValues) => {
        await signIn(values.email, values.password);
    };
    const logo = isDark ? blackScreenLogo : whiteScreenLogo;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        {/* Illustration */}
                        <View style={styles.illustrationContainer}>
                            <Image
                                source={logo}
                                style={styles.illustration}
                                resizeMode="contain"
                            />
                        </View>



                        {/* Login Card */}
                        <View style={styles.card}>
                            <Text style={styles.title}>CentralCare+</Text>
                            <Text style={styles.subtitle}>Welcome back!</Text>

                            <Formik
                                initialValues={{ email: '', password: '' }}
                                validationSchema={LoginSchema}
                                onSubmit={handleLogin}
                            >
                                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                                    <View>
                                        {/* Username Field */}
                                        <View style={styles.inputContainer}>
                                            <View style={styles.iconContainer}>
                                                <Ionicons name="mail-outline" size={20} color={theme.text} />
                                                <Text style={styles.label}>Username/Email</Text>
                                            </View>
                                            {/* <Text style={styles.label}>Username</Text> */}
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    touched.email && errors.email ? styles.inputError : null
                                                ]}
                                                placeholder="Username/Email"
                                                placeholderTextColor={theme.placeholder}
                                                value={values.email}
                                                onChangeText={handleChange('email')}
                                                onBlur={handleBlur('email')}
                                                autoCapitalize="none"
                                            />
                                            {touched.email && errors.email && (
                                                <Text style={styles.errorText}>{errors.email}</Text>
                                            )}
                                        </View>

                                        {/* Password Field */}
                                        <View style={styles.inputContainer}>
                                            <View style={styles.iconContainer}>
                                                <Ionicons name="lock-closed-outline" size={20} color={theme.text} />
                                                <Text style={styles.label}>Password</Text>
                                            </View>
                                            <View style={[
                                                styles.passwordContainer,
                                                touched.password && errors.password ? styles.inputError : null
                                            ]}>
                                                <TextInput
                                                    style={styles.passwordInput}
                                                    placeholder="••••••••"
                                                    placeholderTextColor={theme.placeholder}
                                                    value={values.password}
                                                    onChangeText={handleChange('password')}
                                                    onBlur={handleBlur('password')}
                                                    secureTextEntry={!isPasswordVisible}
                                                />
                                                <TouchableOpacity
                                                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                                    style={styles.eyeIcon}
                                                >
                                                    <Ionicons
                                                        name={isPasswordVisible ? "eye-off" : "eye"}
                                                        size={20}
                                                        color={theme.iconSecondary}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                            {touched.password && errors.password && (
                                                <Text style={styles.errorText}>{errors.password}</Text>
                                            )}
                                        </View>

                                        {/* Login Button */}
                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => handleSubmit()}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicatorComponent inline />
                                            ) : (
                                                <Text style={styles.buttonText}>Login</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </Formik>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;
