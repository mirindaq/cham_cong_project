import type { AttendanceUpdateRequest } from "@/types/attendance.type";
import http from "@/utils/http";

interface CheckInRequest {
  locationId: number;
  latitude: number;
  longitude: number;
  workShiftId: number;
  file: string;
}

export const attendanceApi = {
  getAttendanceByEmployee: async (month: number, year: number) => {
    const response = await http.get(
      `/attendances/employee?month=${month}&year=${year}`
    );
    return response.data;
  },
  getAttendanceByEmployeeAndDate: async (employeeEmail: string, date: string) => {
    const params = new URLSearchParams();
    params.set("employeeName", employeeEmail);
    params.set("date", date);
    const response = await http.get("/attendances", { params });
    return response.data;
  },
  checkIn: async (checkInData: CheckInRequest) => {
    const response = await http.post("/attendances/check-in", checkInData);
    return response.data;
  },
  checkOut: async (checkOutData: any) => {
    const response = await http.post("/attendances/check-out", checkOutData);
    return response.data;
  },
  getAllAttendances: async (params: URLSearchParams) => {
    const response = await http.get("/attendances", { params });
    return response.data;
  },
  getRecentAttendances: async () => {
    const response = await http.get("/attendances/recent-checker");
    return response.data;
  },
  updateAttendance: async (id: number, data: AttendanceUpdateRequest) => {
    const response = await http.put(`/attendances/update/${id}`, data);
    return response.data;
  },
};
