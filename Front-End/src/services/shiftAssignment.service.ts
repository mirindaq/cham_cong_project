import http from "@/utils/http";

export const shiftAssignmentApi = {
  getAllAssignments: async (dataFilter?: any) => {
    const response = await http.get("/shift-assignments", {
      params: dataFilter,
    });
    return response.data.data;
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

  getEmployeeToAssignment: async () => {
    const response = await http.get(
      "/shift-assignments/employee-to-assignment"
    );
    return response.data.data;
  },
};
