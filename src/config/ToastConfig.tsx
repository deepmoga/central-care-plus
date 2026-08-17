import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, InfoToast, ToastConfig } from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors } from '../theme/types';

// We need a wrapper component to access the theme context
export const getToastConfig = (theme: ThemeColors): ToastConfig => ({
    success: (props) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: theme.success,
                backgroundColor: theme.surface,
                borderLeftWidth: 5,
                borderRadius: 8,
                width: '90%',
                height: 60,
                shadowColor: theme.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 15,
                fontWeight: '600',
                color: theme.text
            }}
            text2Style={{
                fontSize: 13,
                color: theme.textSecondary
            }}
        />
    ),
    error: (props) => (
        <ErrorToast
            {...props}
            style={{
                borderLeftColor: theme.error,
                backgroundColor: theme.surface,
                borderLeftWidth: 5,
                borderRadius: 8,
                width: '90%',
                height: 60,
                shadowColor: theme.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 15,
                fontWeight: '600',
                color: theme.text
            }}
            text2Style={{
                fontSize: 13,
                color: theme.textSecondary
            }}
        />
    ),
    info: (props) => (
        <InfoToast
            {...props}
            style={{
                borderLeftColor: theme.info,
                backgroundColor: theme.surface,
                borderLeftWidth: 5,
                borderRadius: 8,
                width: '90%',
                height: 60,
                shadowColor: theme.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 15,
                fontWeight: '600',
                color: theme.text
            }}
            text2Style={{
                fontSize: 13,
                color: theme.textSecondary
            }}
        />
    ),
});
