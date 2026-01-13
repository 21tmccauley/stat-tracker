// services/api.js
// Central API client for all backend calls

// STEP 1: Import what you need from auth service
// - You need getCurrentSession() to get the JWT token
import { getCurrentSession } from './auth';

// STEP 2: Configuration
// - API_BASE_URL from environment variable (VITE_API_GATEWAY_URL)
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL;

async function getAuthToken() {
    const session = await getCurrentSession();
    if (!session) {
        throw new Error('User not authenticated');
    }
    return session.getIdToken().getJwtToken();
}

async function apiRequest(method, endpoint, body = null) {
    const token = await getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    const data = await response.json();
    
    // Check for API errors (4xx, 5xx status codes)
    if (!response.ok) {
        throw new Error(data.message || data.error || `API error: ${response.status}`);
    }
    
    return data;
}

// STEP 5: Export specific API functions
// - getUserData(): GET /user-data
// - createHabit(habitData): POST /habits
// - completeHabit(habitId): POST /habits/complete
export function getUserData() {
    return apiRequest('GET', '/user-data');
}
export function createHabit(habitData) {
    return apiRequest('POST', '/habits', habitData);
}
export function completeHabit(habitId) {
    return apiRequest('POST', '/habits/complete', { habitId });
}

export default {
    getUserData,
    createHabit,
    completeHabit
}