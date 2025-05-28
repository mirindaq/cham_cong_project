import axios from 'axios';
import { toast } from 'sonner';

const http = axios.create({
  baseURL: 'http://localhost:8080/api/v1',  // Thay bằng URL backend của bạn
  timeout: 10000, // timeout 10s
  headers: {
    'Content-Type': 'application/json',
    // Bạn có thể thêm token hoặc header tùy chỉnh ở đây
  },
});

// Ví dụ thêm interceptor để tự động thêm Authorization token
http.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('accessToken'); // hoặc lấy từ context/state
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response để xử lý lỗi chung
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý logout hoặc refresh token
      console.log('Unauthorized, please login again.');
    }
    // toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại!")
    return Promise.reject(error);
  }
);

export default http;
