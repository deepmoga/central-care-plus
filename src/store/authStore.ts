import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, LoginResponse } from '../api/auth.service';
import { setAuthToken, setSignOutCallback } from '../api/api';
import Toast from 'react-native-toast-message';
export interface User {
    id: number;
    email: string;
    user_name?: string;
    profile_photo?: string;
    token: string;
    // Client specific fields
    client_name?: string;
    client_user_name?: string;
    family_name?: string;
    full_name?: string;
}

interface AuthState {
    user: User | null;
    role: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            role: null,
            isLoading: false,
            isAuthenticated: false,

            signIn: async (email, password) => {
                set({ isLoading: true });
                try {
                    const response = await loginUser(email, password);
                    const data = response as any; // Using any to handle dynamic response structure

                    if (data?.success === true || data?.role) { // Check for success or role presence
                        const role = data.role || 'user';

                        let user: User;

                        if (role === 'client') {
                            user = {
                                email: data.user.email,
                                token: data.token || '', // Token might be in a different place or handled differently? Assuming standard place or need to check
                                id: data.user.id,
                                client_name: data.user.client_name,
                                client_user_name: data.user.client_user_name,
                                family_name: data.user.family_name,
                                full_name: data.user.full_name,
                                profile_photo: data.user.profile_photo,
                                user_name: data.user.client_user_name // Fallback/Alias for easier usage
                            };
                        } else {
                            // Carer / Default User
                            user = {
                                email,
                                token: data.token,
                                user_name: data?.user?.user_name,
                                profile_photo: data?.user?.profile_photo,
                                id: data?.user?.id,
                            };
                        }

                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false,
                            role: role,
                        });

                        Toast.show({
                            type: 'success',
                            text1: 'Login successful',
                            position: 'top',
                            visibilityTime: 1200,
                        });
                    } else {
                        set({ isLoading: false });
                        Toast.show({
                            type: 'error',
                            text1: 'Login failed',
                            text2: 'Invalid credentials',
                            position: 'top',
                        });
                    }
                } catch (error: any) {
                    set({ isLoading: false });
                    const status = error?.response?.status;

                    if (status === 401) {
                        Toast.show({
                            type: 'error',
                            text1: 'Login failed',
                            text2: "Invalid credentials",
                            position: 'top',
                        });
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: 'Error',
                            text2: "Something went wrong",
                            position: 'top',
                        });
                    }
                }
            },

            signOut: async () => {
                try {
                    await AsyncStorage.removeItem('auth-storage');
                } catch (e) {
                    console.error("Failed to clear auth storage", e);
                }
                set({ user: null, isAuthenticated: false, role: null });
            },

            setUser: (user) => {
                set({ user, isAuthenticated: !!user });
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ user: state.user, role: state.role, isAuthenticated: state.isAuthenticated }),
            onRehydrateStorage: () => (state) => {
                if (state?.user?.token) {
                    setAuthToken(state.user.token);
                }
            }
        }
    )
);

// Subscribe to changes to keep the token in sync
useAuthStore.subscribe((state) => {
    setAuthToken(state.user?.token || '');
});

// Register the sign out callback to break circular dependency
setSignOutCallback(() => {
    useAuthStore.getState().signOut();
});
