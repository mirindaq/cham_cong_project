export type WorkShiftResponse = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  partTime: boolean;
  active: boolean;
};

export type WorkShiftAddRequest = Omit<WorkShiftResponse, "id">;
