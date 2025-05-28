import http from "@/utils/http";

export const shiftAssignmentApi = {
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

  getAllAssignments: async (dataFilter?: any) => {
    try {
      const response = await http.get("/shift-assignments", {
        params: dataFilter,
      });
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phân ca:", error);
      return null;
    }
  },

  assignShifts: async (assignments: any[]) => {
    const response = await http.post("/shift-assignments/add", {
      workShiftAssignments: assignments,
    });
    return response.data.data;
  },

  deleteAssignment: async (assignmentId: number, employeeId: number) => {
    await http.delete("/shift-assignments/delete", {
      params: {
        employeeId,
        workShiftAssignmentId: assignmentId,
      },
    });
    return true;
  },
};
