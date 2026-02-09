import axios from "axios";
import { store } from "../store";
import { setLoading } from "../store/slices/uiSlice";

const api = axios.create({
    baseURL: "/api",
});

let activeRequests = 0;

const updateLoading = (delta: number) => {
    activeRequests += delta;
    store.dispatch(setLoading(activeRequests > 0));
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("ofm_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        updateLoading(1);
        return config;
    },
    (error) => {
        updateLoading(-1);
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response) => {
        updateLoading(-1);
        return response;
    },
    (error) => {
        updateLoading(-1);
        return Promise.reject(error);
    },
);

export default api;
