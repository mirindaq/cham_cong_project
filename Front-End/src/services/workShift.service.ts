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

  addShift: async (newShift: {
    name: string;
    startTime: string;
    endTime: string;
  }) => {
    const response = await http.post("/work-shifts/add", newShift);
    return response.data.data;
  },

  deleteShift: async (shiftId: number) => {
    await http.delete(`/work-shifts/delete/${shiftId}`);
  },
  getWorkShiftsByEmployeeIdBetweenDate: async (
    employeeId: number,
    startDate: string,
    endDate: string
  ) => {
    const response = await http.get(`/work-shifts/employee/${employeeId}`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },
};
