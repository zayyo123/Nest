import axios from "axios";

// Vite and Nginx both proxy /api to the NestJS backend, keeping components env-free.
const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use(
  (config) => {
    const token =
      typeof localStorage !== "undefined" ? localStorage.getItem("token") : "";
    if (token && config) {
      if (!config.headers) config.headers = {};
      // The backend currently accepts a demo token, but this shape matches real JWT auth.
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err),
);

export default api;
