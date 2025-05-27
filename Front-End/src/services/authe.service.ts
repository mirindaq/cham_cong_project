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
  changePasswordFirstLogin: async (passwordData: any) => {
    const response = await http.post("/auth/change-password-first-login", passwordData);
    return response.data;
  },
};
