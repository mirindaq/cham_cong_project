import type { ShiftChangeAddRequest } from "@/types/shiftChangeRequest.type";
import http from "@/utils/http";

export const shiftChangeRequestApi = {
  createShiftChangeRequest: async (
    shiftChangeAddRequest: ShiftChangeAddRequest
  ) => {
    const response = await http.post(
      "/shift-change-requests",
      shiftChangeAddRequest
    );
    return response;
  },

  getSentShiftChangeRequests: async (page: number, size: number) => {
    const response = await http.get(
      `/shift-change-requests/employee/sent?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  recallShiftChangeRequest: async (id: number) => {
    const response = await http.put(`/shift-change-requests/${id}/recall`);
    return response.data;
  },

  getReceivedShiftChangeRequests: async (page: number, size: number) => {
    const response = await http.get(
      `/shift-change-requests/employee/received?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  employeeApproveShiftChangeRequest: async (id: number) => {
    const response = await http.put(
      `/shift-change-requests/employee/${id}/approve`
    );
    return response.data;
  },

  employeeRejectShiftChangeRequest: async (id: number) => {
    const response = await http.put(
      `/shift-change-requests/employee/${id}/reject`
    );
    return response.data;
  },

  getShiftChangeRequestAdmin: async (dataFilter: any) => {
    const response = await http.get(`/shift-change-requests`, {
      params: dataFilter,
    });
    return response.data.data;
  },

  adminApproveShiftChangeRequest: async (id: number, handleRequest: any) => {
    const response = await http.put(
      `/shift-change-requests/admin/${id}/approve`,
      handleRequest
    );
    return response.data;
  },
  adminRejectShiftChangeRequest: async (id: number, handleRequest: any) => {
    const response = await http.put(
      `/shift-change-requests/admin/${id}/reject`,
      handleRequest
    );
    return response.data;
  },
};
