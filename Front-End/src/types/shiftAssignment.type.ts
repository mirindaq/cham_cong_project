import type { WorkShift } from "@/types/workShiftAssignment.type";

export type WorkShiftAssignmentResponse = {
  id: number;
  dateAssign: string;
  workShift: WorkShift;
  employeeId: number;
  employeeName: string;
  employeeDepartmentName: string;
};
