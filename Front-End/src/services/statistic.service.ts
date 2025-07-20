import http from "@/utils/http";

export const statisticApi = {
  getWeeklyAttendanceStatistics: async () => {
    const response = await http.get("/statistics/weekly-attendance");
    return response.data;
  },
  getTotalLeaveInDay: async () => {
    const response = await http.get("/statistics/total-leave-in-day");
    return response.data;
  },
  getLeaveOverallStatistics: async () => {
    const response = await http.get("/statistics/leave-overall");
    return response.data;
  },

  getTopFiveStaffAttendanceByMonth: async (month: number, year: number) => {
    const response = await http.get(
      `/statistics/top-five-staff-attendance/${month}/${year}`
    );
    return response.data;
  },

  getOverallByMonth: async (month: number, year: number) => {
    const response = await http.get(`/statistics/overall/${month}/${year}`);
    return response.data;
  },

  getLeaveOverallStatisticsByMonth: async (month: number, year: number) => {
    const response = await http.get(
      `/statistics/leave-overall/${month}/${year}`
    );
    return response.data;
  },
  exportOverallByMonth: async (month: number, year: number) => {
    const response = await http.get(`/statistics/export/${month}/${year}`, {
      responseType: "blob",
    });
    return response.data;
  },

  getOverallAttendanceEmployeeByYear: async (year: number) => {
    const response = await http.get(`/statistics/overall-attendance/${year}`);
    return response.data.data;
  },
  getOverallEmployee: async (month: number, year: number) => {
    const response = await http.get(
      `/statistics/overall-employee/${month}/${year}`
    );
    return response.data.data;
  },
  getLeaveOverallEmployeeStatistics: async (year: number) => {
    const response = await http.get(
      `/statistics/leave-overall-employee/${year}`
    );
    return response.data.data;
  },
};
