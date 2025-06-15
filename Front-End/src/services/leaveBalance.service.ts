import http from "@/utils/http";

export const leaveBalanceApi = {
  getLeaveBalanceByEmployee: async () => {
    const response = await http.get(`/leave-balances/employee`);
    return response.data;
  },

  getAllLeaveBalance: async (params: any) => {
    const response = await http.get("/leave-balances", { params });
    return response.data;
  },
};
