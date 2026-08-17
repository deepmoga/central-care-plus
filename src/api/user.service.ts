import api from './api';

export const getUserProfile = async (userId: number): Promise<any> => {
    try {
        const response = await api.get(`/carer_profile_api.php?id=${userId}`);
        return response.data;
    } catch (error) {
        return error;
    }
};

export const updateUserProfile = async (userId: number, formData: FormData): Promise<any> => {
    try {
        const response = await api.post(`/update_carer_profile.php?id=${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

export const getClientProfile = async (clientId: any): Promise<any> => {
    try {
        const response = await api.get(`/client_profile_api.php?id=${clientId}`);
        return response.data;
    } catch (error) {
        return error;
    }
};

export const getClientServices = async (clientId: number, startDate: string, endDate: string): Promise<any> => {
    try {
        const response = await api.get(`/client_services_get_api.php?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}`);
        return response.data;
    } catch (error) {
        return error;
    }
};
export const getClientStatements = async (clientId: any): Promise<any> => {
    try {
        const response = await api.get(`client_statement_api.php?id=${clientId}`);
        return response.data;
    } catch (error) {
        return error;
    }
};

export const updateClientProfile = async (clientId: number, formData: FormData): Promise<any> => {
    try {
        const response = await api.post(`/update_client_profile.php?id=${clientId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        return error;
    }
};
