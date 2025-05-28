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
};
