import type { LeaveType } from "./leaveType";
import type { WorkShiftResponse } from "@/types/workShift.type";

export type LeaveRequestAdd = {
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
  workShift: WorkShiftResponse;
};

export enum LeaveRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RECALLED = "RECALLED",
}
