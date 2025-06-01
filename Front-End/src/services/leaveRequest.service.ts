import type { LeaveRequestAdd } from "@/types/leaveRequest.type";
import http from "@/utils/http";
import axios from "axios";

export const leaveRequestApi = {
  getAllLeaveRequests: async (dataFilter: any) => {
    const response = await http.get(`/leave-requests`, {
      params: dataFilter,
    });

    return response.data.data;
  },

  getAllLeaveRequestsByEmployee: async (
    employeeId: number,
    page = 1,
    size = 3
  ) => {
    const response = await http.get(`/leave-requests/employee/${employeeId}`, {
      params: { page, size },
    });
    return response.data.data;
  },

  createLeaveRequest: async (leaveRequestData: LeaveRequestAdd) => {
    const response = await http.post("/leave-requests", leaveRequestData);
    return response.data.data;
  },

  recallLeaveRequest: async (id: number) => {
    const response = await http.put(`/leave-requests/${id}/recall`);
    return response.data;
  },

  getPendingLeaveRequests: async () => {
    const response = await http.get("/leave-requests/pending");
    return response.data;
  },

  approveLeaveRequest: async (
    id: number,
    responseNote: string,
    responseById: number
  ) => {
    const response = await http.put(`/leave-requests/${id}/approve`, {
      responseNote,
      responseById,
    });
    return response.data;
  },
  rejectLeaveRequest: async (
    id: number,
    responseNote: string,
    responseById: number
  ) => {
    const response = await http.put(`/leave-requests/${id}/reject`, {
      responseNote,
      responseById,
    });
    return response.data;
  },
};
