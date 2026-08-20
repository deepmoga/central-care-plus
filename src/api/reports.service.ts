import api from './api';

export const getServiceReport = async (userId: string, startDate: string | "", endDate: string | ""): Promise<any> => {
    try {
        const response = await api.get(`/service_report_api.php?carer_id=${userId}&start_date=${startDate}&end_date=${endDate}`);
        return response.data;
    } catch (error) {
        return error;
    }
};

export const getTimesheets = async (carerId: string): Promise<any> => {
    try {
        const response = await api.get(`/carer_period_documents_api.php?carer_id=${carerId}`);
        return response.data;
    } catch (error) {
        return error;
    }
};
export const getCarerCuresAlerts = async (carerId: string): Promise<any> => {
    try {
        const response = await api.get(`/get_carer_cures_alerts_api.php?carer_id=${carerId}`);
        return response.data;
    } catch (error) {
        return error;
    }
};
