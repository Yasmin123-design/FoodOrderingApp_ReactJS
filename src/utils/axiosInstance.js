import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor to inject the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add a response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and not a retry yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        return new Promise(async (resolve, reject) => {
          try {
            const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
              headers: {
                'Authorization': `Bearer ${refreshToken}`
              }
            });

            const { access_token } = response.data;

            if (access_token) {
              localStorage.setItem('token', access_token);
              axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
              originalRequest.headers['Authorization'] = 'Bearer ' + access_token;
              processQueue(null, access_token);
              resolve(axiosInstance(originalRequest));
            }
          } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        });
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
