import type { ChangePasswordFirstLoginRequest } from "@/types/auth.type";
import http from "@/utils/http";

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await http.post("/auth/login", { username, password });
    return response.data;
  },
  forgotPassword: async (email: string) => {
    console.log(email);
    const response = await http.post("/auth/forgot-password", { email });
    return response.data;
  },

  changePassword: async (passwordData: any) => {
    const response = await http.post("/auth/change-password", passwordData);
    return response.data;
  },
  changePasswordFirstLogin: async (data: ChangePasswordFirstLoginRequest) => {
    const response = await http.post("/auth/change-password-first-login", data);
    return response.data;
  },
  logout: async () => {
    const response = await http.post("/auth/logout");
    return response.data;
  },
  refreshToken: async (refreshToken: string) => {
    const response = await http.post("/auth/refresh-token", { refreshToken });
    return response.data;
  },
};
