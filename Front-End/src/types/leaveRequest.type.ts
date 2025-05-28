export type LeaveRequestAdd = {
  employeeId: number;
  startDate: Date;
  endDate: Date;
  reason: string;
  leaveTypeId: number;
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
export type LeaveType = {
  id: number;
  name: string;
  maxDayPerYear: number;
};
