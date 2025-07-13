import http from "@/utils/http";

export const otpApi = {
  sendOtp: async (email: string) => {
    const response = await http.post("/otp/send", { email });
    return response.data;
  },

  verifyOtp: async (email: string, otpCode: string) => {
    const response = await http.post("/otp/verify", { email, otpCode });
    return response.data;
  },

  resetPasswordWithOtp: async (request: any) => {
    const response = await http.post("/otp/reset-password", request);
    return response.data;
  },
};
