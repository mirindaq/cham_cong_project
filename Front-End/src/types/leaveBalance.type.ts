import type { LeaveType } from "@/types/leaveType";

export type LeaveBalancePerEmployeeResponse = {
  id: number;
  usedDay: number;
  year: number;
  remainingDay: number;
  employeeName: string;
  departmentName: string;
  leaveType: LeaveType;
};
