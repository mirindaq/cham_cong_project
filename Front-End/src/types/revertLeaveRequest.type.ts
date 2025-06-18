import type { WorkShift } from "@/types/workShiftAssignment.type";

export type RevertLeaveRequestAddRequest = {
  date: string;
  reason: string;
  workShiftId: number;
};

export type RevertLeaveRequestResponse = {
  id: number;
  date: string;
  reason: string;
  responseNote: string;
  responseDate: string;
  responseBy: string;
  employeeName: string;
  departmentName: string;
  status: RevertLeaveRequestStatus;
  createdAt: string;
  workShift: WorkShift;
};

export enum RevertLeaveRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RECALLED = "RECALLED",
}
