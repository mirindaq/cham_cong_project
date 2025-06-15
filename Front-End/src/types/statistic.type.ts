export type WeeklyAttendanceStatistics = {
  currentDate: string;
  attendanceOfWeek: AttendanceDailyResponse[];
};

export type AttendanceDailyResponse = {
  date: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  total: number;
};
