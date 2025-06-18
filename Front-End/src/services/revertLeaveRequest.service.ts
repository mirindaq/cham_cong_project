import type { RevertLeaveRequestAddRequest } from "@/types/revertLeaveRequest.type";
import http from "@/utils/http";

export const revertLeaveRequestApi = {
  getAllRevertLeaveRequests: async (params: any) => {
    const response = await http.get("/revert-leave-requests", { params });
    return response.data;
  },

  getAllRevertLeaveRequestsByEmployee: async (page = 1, size = 3) => {
    const response = await http.get("/revert-leave-requests/employee", {
      params: { page, size },
    });
    return response.data;
  },

  createRevertLeaveRequest: async (
    revertLeaveRequestData: RevertLeaveRequestAddRequest
  ) => {
    const response = await http.post(
      "/revert-leave-requests",
      revertLeaveRequestData
    );
    return response.data;
  },

  recallRevertLeaveRequest: async (id: number) => {
    const response = await http.put(`/revert-leave-requests/${id}/recall`);
    return response.data;
  },

  approveRevertLeaveRequest: async (id: number, responseNote: string) => {
    const response = await http.put(`/revert-leave-requests/${id}/approve`, {
      responseNote,
    });
    return response.data;
  },

  rejectRevertLeaveRequest: async (id: number, responseNote: string) => {
    const response = await http.put(`/revert-leave-requests/${id}/reject`, {
      responseNote,
    });
    return response.data;
  },
};
