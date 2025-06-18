import type { WorkShiftAddRequest } from "@/types/workShift.type";
import http from "@/utils/http";

export const workShiftApi = {
  getAllShifts: async () => {
    try {
      const response = await http.get("/work-shifts");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ca làm việc:", error);
      return null;
    }
  },

  addShift: async (newShift: WorkShiftAddRequest) => {
    const response = await http.post("/work-shifts/add", newShift);
    return response.data.data;
  },

  deleteShift: async (shiftId: number) => {
    await http.delete(`/work-shifts/delete/${shiftId}`);
  },
  getWorkShiftsByEmployeeIdBetweenDate: async (
    startDate: string,
    endDate: string
  ) => {
    const response = await http.get(`/work-shifts/employee`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },
  getWorkShiftsByEmployeeByDateHaveAttendanceLeave: async (date: string) => {
    const response = await http.get(
      `/work-shifts/employee/attendance-leave?date=${date}`
    );
    return response.data;
  },

  getAllWorkShiftsActive: async () => {
    const response = await http.get("/work-shifts/active");
    return response.data.data;
  },

  updateWorkShift: async (shiftId: number) => {
    const response = await http.put(`/work-shifts/update/${shiftId}/status`);
    return response.data.data;
  },

  getAllWorkShiftsPartTimeActive: async () => {
    const response = await http.get("/work-shifts/part-time/active");
    return response.data.data;
  },

  getAllWorkShiftsPartTime: async () => {
    const response = await http.get("/work-shifts/part-time/all");
    return response.data.data;
  },
};
