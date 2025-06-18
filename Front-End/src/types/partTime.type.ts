import type { WorkShiftResponse } from "@/types/workShift.type";

export type PartTimeRequestAddRequest = {
  date: string;
  workShiftId: number;
};

export type PartTimeRequestResponse = {
  id: number;
  date: string;
  employeeName: string;
  departmentName: string;
  responseDate: string;
  responseBy: string;
  responseNote: string;
  status: PartTimeRequestStatus;
  workShift: WorkShiftResponse;
  createdAt: string;
};

export enum PartTimeRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RECALLED = "RECALLED",
}
