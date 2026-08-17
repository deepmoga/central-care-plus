import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

import Toast from 'react-native-toast-message';

const api: AxiosInstance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let authToken: string;

export const setAuthToken = (token: string) => {
    authToken = token;
};

// Request Interceptor
api.interceptors.request.use(
    (config: any) => {
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

let signOutCallback: (() => void) | null = null;

export const setSignOutCallback = (callback: () => void) => {
    signOutCallback = callback;
};

// Response Interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            const { status, data } = error.response;
            // Check for 401 status and specific message
            // User specified: success true and message "Invalid or expired token"
            // We'll check data.message safely
            if (status === 401 && (data as any)?.message === "Invalid or expired token") {
                // Redirect user to login screen (by signing out)
                if (signOutCallback) {
                    signOutCallback();
                }

                // Show toast
                Toast.show({
                    type: 'error',
                    text1: 'Session expired',
                    text2: 'Please login again',
                    position: 'top',
                });
            }
        }
        return Promise.reject(error);
    }
);

export default api;
