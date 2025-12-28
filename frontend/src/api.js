import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 关键：允许发送cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 处理未授权错误
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;