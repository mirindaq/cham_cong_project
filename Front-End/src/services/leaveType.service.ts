import type { LeaveType } from "@/types/leaveType";
import http from "@/utils/http";

export const leaveTypeApi = {
  getAllLeaveTypes: async () => {
    try {
      const response = await http.get("/leave-types");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại nghỉ phép:", error);
      return null;
    }
  },

  addLeaveType: async (newLeaveType: Omit<LeaveType, "id">) => {
    const response = await http.post("/leave-types/add", newLeaveType);
    return response.data.data;
  },

  getLeaveTypeEnableInYear: async (employeeId: number) => {
    const response = await http.get(`/leave-types/employee/${employeeId}`);
    return response.data.data;
  },
};
