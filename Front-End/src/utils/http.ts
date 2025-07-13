import { authApi } from "@/services/authe.service";
import { localStorageUtil } from "@/utils/localStorageUtil";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const http = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Biến để theo dõi việc refresh token đang được thực hiện
let isRefreshing = false;
// Hàng đợi các request đang chờ refresh token
let failedQueue: any[] = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshTokenRequest = async () => {
  try {
    const refreshToken = localStorageUtil.getRefreshTokenFromLocalStorage();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await authApi.refreshToken(refreshToken);
    const { accessToken } = response.data;
    localStorageUtil.setAccessTokenToLocalStorage(accessToken);

    return accessToken;
  } catch (error) {
    throw error;
  }
};

http.interceptors.request.use(
  (config) => {
    const token = localStorageUtil.getAccessTokenFromLocalStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    console.error("HTTP Error:", error);

    const { response, message, request, config } = error;
    const errorDetails = {
      timestamp: new Date().toISOString(),
      status: 500,
      error: "Unknown Error",
      path: request?.responseURL || "N/A",
      message: "Đã xảy ra lỗi không xác định",
    };

    if (response) {
      const { status, data } = response as {
        status: number;
        data: { message: string };
      };
      errorDetails.status = status;
      errorDetails.error = response.statusText || "Unknown Error";
      errorDetails.path = response.config.url;
      errorDetails.message = data.message || "Lỗi không xác định";

      switch (status) {
        case 401:
          if (data.message === "Token expired") {
            if (!isRefreshing) {
              isRefreshing = true;
              try {
                const newToken = await refreshTokenRequest();
                if (config) {
                  config.headers.Authorization = `Bearer ${newToken}`;
                  processQueue(null, newToken);
                  return http(config);
                }
              } catch (refreshError) {
                processQueue(refreshError, null);
                localStorageUtil.removeAuthFromLocalStorage();
                window.location.href = "/login";
                toast.error(
                  "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                );
              } finally {
                isRefreshing = false;
              }
            } else {
              // Nếu đang refresh token, thêm request vào hàng đợi
              return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
              })
                .then((token) => {
                  if (config) {
                    config.headers.Authorization = `Bearer ${token}`;
                    return http(config);
                  }
                })
                .catch((err) => {
                  return Promise.reject(err);
                });
            }
          } else {
            toast.error("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
          }
          break;
        case 500:
          if (data.message === "Not enough leave balance for this request") {
            toast.error("Không đủ số ngày nghỉ phép để thực hiện yêu cầu này.");
          } 
          break;
      }
    } else if (request) {
      toast.error("Không nhận được phản hồi từ server. Kiểm tra kết nối mạng.");
    } else {
      toast.error(`Lỗi không xác định khi gửi request: ${message}`);
    }

    return Promise.reject(errorDetails);
  }
);

export default http;
