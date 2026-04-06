import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// API methods
export const analyzePrompt = async (prompt) => {
    try {
        const response = await apiClient.post('/analyze', { prompt });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to analyze prompt' };
    }
};

export const getHistory = async (limit = 20) => {
    try {
        const response = await apiClient.get(`/history?limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch history' };
    }
};

export const deleteHistory = async (historyId) => {
    try {
        const response = await apiClient.delete(`/history/${historyId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to delete history' };
    }
};

export const getSamplePrompts = async () => {
    try {
        const response = await apiClient.get('/sample-prompts');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch samples' };
    }
};

export const getModelsInfo = async () => {
    try {
        const response = await apiClient.get('/models');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch models info' };
    }
};

export const getApiStatus = async () => {
    try {
        const response = await apiClient.get('/api-status');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to check API status' };
    }
};

export const healthCheck = async () => {
    try {
        const response = await apiClient.get('/health');
        return response.data;
    } catch (error) {
        return { status: 'error' };
    }
};

export default apiClient;
