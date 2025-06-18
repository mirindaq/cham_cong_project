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
  getAllLeaveTypesActive: async () => {
    try {
      const response = await http.get("/leave-types/active");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại nghỉ phép:", error);
      return null;
    }
  },

  addLeaveType: async (newLeaveType: Omit<LeaveType, "id" | "active">) => {
    const response = await http.post("/leave-types/add", newLeaveType);
    return response.data.data;
  },

  getLeaveTypeEnableInYear: async () => {
    const response = await http.get(`/leave-types/employee`);
    return response.data.data;
  },

  updateLeaveType: async (leaveTypeId: number, leaveTypeUpdateRequest: any) => {
    const response = await http.put(
      `/leave-types/update/${leaveTypeId}`,
      leaveTypeUpdateRequest
    );
    return response.data.data;
  },

  toggleApply: async (leaveTypeId: number) => {
    const response = await http.put(
      `/leave-types/update/${leaveTypeId}/status`
    );
    return response.data.data;
  },
};
