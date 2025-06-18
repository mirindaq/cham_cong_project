import type { PartTimeRequestAddRequest } from "@/types/parttime.type";
import http from "@/utils/http";

export const partTimeApi = {
  getAllPartTimeRequests: async (dataFilter: any) => {
    const response = await http.get("/part-time-requests", {
      params: dataFilter,
    });
    return response.data.data;
  },

  getAllPartTimeRequestsByEmployee: async (page = 1, size = 3) => {
    const response = await http.get("/part-time-requests/employee", {
      params: { page, size },
    });
    return response.data.data;
  },

  createPartTimeRequest: async (
    partTimeRequestData: PartTimeRequestAddRequest
  ) => {
    const response = await http.post(
      "/part-time-requests",
      partTimeRequestData
    );
    return response.data;
  },

  recallPartTimeRequest: async (id: number) => {
    const response = await http.put(`/part-time-requests/${id}/recall`);
    return response.data;
  },

  approvePartTimeRequest: async (id: number, responseNote: string) => {
    const response = await http.put(`/part-time-requests/${id}/approve`, {
      responseNote,
    });
    return response.data;
  },

  rejectPartTimeRequest: async (id: number, responseNote: string) => {
    const response = await http.put(`/part-time-requests/${id}/reject`, {
      responseNote,
    });
    return response.data;
  },
};
