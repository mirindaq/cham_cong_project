export type UserResponse = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  departmentName: string;
  position: string;
  role: string;
  dob: string;
  joinDate: string;
  employeeType: string;
  active: boolean;
  leaveBalanceResponses: LeaveBalanceResponse[];
  avatar: string | null;
};

export type UserRequest = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  departmentId: number;
  position: string;
  employeeType: string;
  role: string;
  active: boolean;
  dob: string;
  joinDate: string;
};

export type LeaveBalanceResponse = {
  id: number;
  usedDay: number;
  year: number;
  remainingDay: number;
  leaveTypeName: string;
};
