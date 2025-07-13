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

export type TopFiveStaffAttendanceResponse = {
  employeeId: number;
  employeeName: string;
  departmentName: string;
  totalWorkShiftAssignment: number;
  totalAttendanceWorkShift: number;
  totalLateWorkShift: number;
  totalAbsentWorkShift: number;
  totalLeaveWorkShift: number;
  totalWorkingHours: number;
};

export type OverallStatisticMonthResponse = {
  name: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  total: number;
};

export type LeaveOverallResponse = {
  name: string;
  value: number;
};
