export type ShiftChangeAddRequest = {
  date: string;
  targetEmployeeEmail: string;
  reason: string;
  workShiftId: number;
};

export type ShiftChangeRequestResponse = {
  id: number;
  date: string;
  reason: string;
  responseNote: string | null;
  responseDate: string | null;
  workShift: {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
  };
  employeeName: string;
  departmentName: string;
  targetEmployeeName: string;
  targetDepartmentName: string;
  responseBy: string | null;
  status: ShiftChangeRequestStatus;
  createdAt: string;
};

export enum ShiftChangeRequestStatus {
  PENDING = "PENDING",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  REJECTED_APPROVAL = "REJECTED_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RECALLED = "RECALLED",
}
