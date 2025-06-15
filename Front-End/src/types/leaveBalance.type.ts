import type { LeaveType } from "@/types/leaveType";

export type LeaveBalancePerEmployeeResponse = {
  id: number;
  usedDay: number;
  year: number;
  remainingDay: number;
  employeeName: string;
  employeeEmail: string;
  departmentName: string;
  leaveType: LeaveType;
};
