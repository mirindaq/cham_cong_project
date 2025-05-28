import type { WorkShiftAssignment } from "./workShiftAssignment.type";

export type Attendance = {
  workShifts: WorkShiftAssignment;
  date: string;
  checkIn: string;
  checkOut: string;
  attendanceId: number;
  locationName: string;
  status: string;
}