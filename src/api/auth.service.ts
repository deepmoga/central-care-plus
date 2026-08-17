import { AxiosResponse } from 'axios';
import api from './api';

export interface User {
    email: string;
    token?: string;
    user_name?: string;
    profile_photo?: string;
    id?: number;
}

export interface LoginResponse {
    success: boolean | string;
    token?: string;
    message?: string;
    user?: User
}

export const loginUser = async (username: string, password: string): Promise<AxiosResponse<LoginResponse> | any> => {
    try {
        const response = await api.post<LoginResponse>('/login.php', {
            username,
            password,
        });
        return response.data;
    } catch (error: any) {
        return error;
    }
};
