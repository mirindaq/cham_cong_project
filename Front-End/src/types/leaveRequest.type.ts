import type { LeaveType } from "./leaveType";

export type LeaveRequestAdd = {
  employeeId: number;
  startDate: Date;
  endDate: Date;
  reason: string;
  leaveTypeId: number;
  workShiftId: number;
};

export type LeaveRequestResponse = {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  responseNote: string | null;
  responseDate: string | null;
  responseBy: string | null;
  employeeName: string;
  leaveType: LeaveType;
  status: string;
  departmentName: string;
  createdAt: string;
};

export enum LeaveRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RECALLED = "RECALLED",
}
