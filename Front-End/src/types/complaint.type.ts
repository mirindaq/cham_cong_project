export type ComplaintResponse = {
  id: number;
  reason: string;
  date: string;
  createdAt: string;
  responseDate?: string | null;
  responseNote?: string | null;
  responseBy?: string | null;
  employeeName: string;
  complaintType: string;
  status: ComplaintStatus;
  departmentName: string;
};

export interface ComplaintAddRequest {
  reason: string;
  date: Date;
  complaintType: string;
  requestChange: string;
}

export enum ComplaintStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RECALLED = "RECALLED",
}

export enum ComplaintType {
  MISSED_CHECKIN = "Quên Checkin",
  MISSED_CHECKOUT = "Quên Checkout",
  WRONG_TIME = "Sai Giờ",
  WRONG_LOCATION = "Sai Địa Điểm",
  SYSTEM_ERROR = "Lỗi Hệ Thống",
  OTHER = "Khác",
}
