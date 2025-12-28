import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// 存储tokens的函数
const tokenStorage = {
  getAccessToken: () => localStorage.getItem('access_token'),
  setAccessToken: (token) => localStorage.setItem('access_token', token),
  removeAccessToken: () => localStorage.removeItem('access_token'),

  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setRefreshToken: (token) => localStorage.setItem('refresh_token', token),
  removeRefreshToken: () => localStorage.removeItem('refresh_token'),

  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('user'),

  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};

// 创建axios实例
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加Authorization头
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理token过期
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 如果是401错误且不是刷新token的请求，尝试刷新token
    if (error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh') {

      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // 使用refresh token获取新的access token
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // 保存新的tokens
        tokenStorage.setAccessToken(accessToken);
        tokenStorage.setRefreshToken(newRefreshToken);

        // 更新原始请求的Authorization头
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // 重试原始请求
        return api(originalRequest);
      } catch (refreshError) {
        // 刷新失败，清除本地存储并重定向到登录页
        tokenStorage.clear();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    // 如果是403错误，重定向到登录页
    if (error.response?.status === 403) {
      tokenStorage.clear();
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

// 导出api实例和tokenStorage
export { tokenStorage };
export default api;