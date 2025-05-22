import axios from 'axios';
import {store} from '../store';
import {checkAuth} from '../store/slices/authSlice';

const API_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};


axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');


        if (token && !isTokenValid(token)) {
            localStorage.removeItem('token');
            store.dispatch(checkAuth());
            return Promise.reject('Token is invalid');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            store.dispatch(checkAuth());
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 