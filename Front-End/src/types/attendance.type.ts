import type { WorkShiftAssignment } from "./workShiftAssignment.type";

export type Attendance = {
  workShifts: WorkShiftAssignment;
  date: string;
  checkIn: string;
  checkOut: string;
  attendanceId: number;
  locationName: string;
  status: string;
  image: string;
};

export type AttendanceUpdateRequest = {
  locationName: string;
  checkInTime: string;
  checkOutTime: string;
  file: string;
};

export type AttendanceWorkShiftResponse = {
  workShifts: WorkShiftAssignment;
  date: string;
  checkIn: string;
  checkOut: string;
  attendanceId: number;
  locationName: string;
  status: string;
  image: string;
  edited: boolean;
  editedBy: string;
  editedTime: string;
  locked: boolean;
};
