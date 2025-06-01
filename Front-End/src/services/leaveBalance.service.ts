import http from '@/utils/http';

export const leaveBalanceApi = {
  getLeaveBalanceByEmployeeId: async (employeeId: number) => {
    const response = await http.get(`/leave-balances/employee/${employeeId}`);
    return response.data;
  },
}; 