import http from "@/utils/http";

export const attendanceApi = {
  getAttendanceByEmployeeId: async (
    employeeId: number,
    month: number,
    year: number
  ) => {
    const response = await http.get(
      `/attendances/employee/${employeeId}?month=${month}&year=${year}`
    );
    return response.data;
  },
  checkIn: async (checkInData: any) => {
    const response = await http.post("/attendances/check-in", checkInData);
    return response.data;
  },
  checkOut: async (checkOutData: any) => {
    const response = await http.post("/attendances/check-out", checkOutData);
    return response.data;
  },
  getAllAttendances: async (params: URLSearchParams) => {
    const response = await http.get('/api/attendances', { params });
    return response.data;
  },
  updateAttendance: async (id: number, data: any) => {
    const response = await http.put(`/api/attendances/${id}`, data);
    return response.data;
  },
  lockAttendance: async (id: number) => {
    const response = await http.put(`/api/attendances/${id}/lock`);
    return response.data;
  },
  unlockAttendance: async (id: number) => {
    const response = await http.put(`/api/attendances/${id}/unlock`);
    return response.data;
  }
};

