export type WorkShift = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
};

export type WorkShiftAssignment = {
  id: number;
  dateAssign: string;
  workShift: WorkShift;
  employeeName: string;
  employeeDepartmentName: string;
  employeeId: number;
  attendanceId?: number;
};

// public class WorkShiftResponse {
//     private Long id;
//     private String name;
//     private LocalTime startTime;
//     private LocalTime endTime;
// }
export type WorkShiftAssignmentResponse = {
  id: number;
  dateAssign: string;
  workShift: WorkShift;
  employeeName: string;
  employeeDepartmentName: string;
  employeeId: number;
  attendanceId?: number;
};
