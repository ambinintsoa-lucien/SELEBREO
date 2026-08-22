import axios from "axios";

export const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:4000",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("selebreo_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function notifySubscribers(token) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/api/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem(
      "selebreo_refresh_token"
    );

    if (!refreshToken) {
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/refresh`,
        { refreshToken }
      );

      const newAccessToken = data.accessToken;

      localStorage.setItem(
        "selebreo_access_token",
        newAccessToken
      );

      notifySubscribers(newAccessToken);

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      notifySubscribers(null);

      localStorage.removeItem("selebreo_access_token");
      localStorage.removeItem("selebreo_refresh_token");
      localStorage.removeItem("selebreo_user");

      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);