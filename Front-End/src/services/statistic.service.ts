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
};
