export interface RemoteWorkRequestAddRequest {
  date: string;
  workShiftId: number;
  reason: string;
}

export interface RemoteWorkRequestHandleRequest {
  responseNote: string;
}

export enum RemoteWorkRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RECALLED = "RECALLED",
}

export interface WorkShift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

export interface RemoteWorkRequestResponse {
  id: number;
  date: string;
  reason: string;
  status: RemoteWorkRequestStatus;
  createdAt: string;
  responseDate?: string;
  responseBy?: string;
  responseNote?: string;
  employeeName: string;
  departmentName: string;
  workShift: WorkShift;
}
