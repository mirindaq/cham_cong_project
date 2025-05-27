import type { User } from "./user.type";

export type WorkShift = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
};

export type WorkShiftAssignment = {
  id: number;
  dateAssign: string; // Could also be Date type
  workShift: WorkShift;
  employeeName: string;
  employeeDepartmentName: string;
  employeeId: number;
};
