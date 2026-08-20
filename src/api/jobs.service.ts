import api from './api';

export const getJobs = async (carerId?: number, date?: string, endDate?: string, status?: string): Promise<any> => {
    try {
        const response = await api.get(`/services_get_api.php?carer_id=${carerId}&start_date=${date}&end_date=${endDate}&status=${status}`);
        return response.data;
    } catch (error: any) {
        return error;
    }
};

export const getJobById = async (jobId: number, jobTable: string): Promise<any> => {
    try {
        const response = await api.get(`service_get_single_api.php?id=${jobId}&table=${jobTable}`);
        return response.data;
    } catch (error: any) {
        return error;
    }
};

export const checkActiveJobStatus = async (carerId: number): Promise<any> => {
    try {
        const response = await api.get(`/job_status_chack_api.php?carer_id=${carerId}`);
        return response.data;
    } catch (error: any) {
        return error;
    }
};

export const jobStatus = async (payload: any): Promise<any> => {
    try {
        const response = await api.post('/check_in_api.php', payload);
        return response.data;
    } catch (error: any) {
        return error;
    }
};

export const checkOutJob = async (payload: any): Promise<any> => {
    try {
        const response = await api.post('/check_out_api.php', payload);
        return response.data;
    } catch (error: any) {
        return error;
    }
};

export const getJobNotes = async (serviceId: number, table: string): Promise<any> => {
    try {
        const response = await api.get(`/service_note_api.php?service_id=${serviceId}&table_name=${table}`);
        return response.data;
    } catch (error: any) {
        return error;
    }
};

export const addJobNote = async (payload: any): Promise<any> => {
    try {
        const response = await api.post('/service_note_add_api.php', payload);
        return response.data;
    } catch (error: any) {
        return error;
    }
};

export const addSignature = async (payload: any): Promise<any> => {
    try {
        const response = await api.post(`/signature_api.php`, payload);
        return response.data;
    } catch (error: any) {
        return error;
    }
};

export const logEmergency = async (formData: FormData): Promise<any> => {
    try {
        const response = await api.post('/emergency_log_api.php', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error: any) {
        return error;
    }
};

export const getEmergencyLogs = async (jobId: number, jobTable: string): Promise<any> => {
    try {
        const response = await api.get(`/get_emergency_log_api.php?id=${jobId}&table=${jobTable}`);
        return response.data;
    } catch (error: any) {
        return error;
    }
};

export const getCuresAlerts = async (): Promise<any> => {
    try {
        const response = await api.get(`/cures_alerts_api.php`);
        return response.data;
    } catch (error: any) {
        return error;
    }
};

export const saveServiceCuresAlerts = async (payload: any): Promise<any> => {
    try {
        const response = await api.post(`/service_cures_alerts_api.php`, payload);
        return response.data;
    } catch (error: any) {
        return error;
    }
};

export const getServiceCuresAlerts = async (serviceId: number, tableName: string): Promise<any> => {
    try {
        const response = await api.get(`/service_cures_alerts_api.php?service_id=${serviceId}&table_name=${tableName}`);
        return response.data;
    } catch (error: any) {
        return error;
    }
};

export const getReviewQuestions = async (): Promise<any> => {
    try {
        const response = await api.get('/review_questions_api.php');
        return response.data;
    } catch (error: any) {
        return error;
    }
};

export const getReviewAnswers = async (jobId: number, carerId: number, clientId: number, tableName: string): Promise<any> => {
    try {
        const response = await api.get(`/get_review_answers_api.php?job_id=${jobId}&carer_id=${carerId}&client_id=${clientId}&table_name=${tableName}`);
        return response.data;
    } catch (error: any) {
        return error;
    }
};

export const submitReview = async (payload: any): Promise<any> => {
    try {
        const response = await api.post('/submit_review_api.php', payload);
        return response.data;
    } catch (error: any) {
        let errorMsg = error.message;
        if (error.response && error.response.data) {
            if (typeof error.response.data === 'string') {
                errorMsg = error.response.data;
            } else if (error.response.data.message) {
                errorMsg = error.response.data.message;
            } else if (error.response.data.error) {
                errorMsg = error.response.data.error;
            } else {
                errorMsg = JSON.stringify(error.response.data);
            }
        }
        return { success: false, message: errorMsg };
    }
};
