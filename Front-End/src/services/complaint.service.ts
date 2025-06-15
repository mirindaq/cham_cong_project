import type {
  ComplaintAddRequest,
  ComplaintResponse,
} from "@/types/complaint.type";
import http from "@/utils/http";

export const complaintApi = {
  getAllComplaints: async (dataFilter: any) => {
    const response = await http.get(`/complaints`, {
      params: dataFilter,
    });
    return response.data.data;
  },

  getAllComplaintsByEmployee: async (
    page = 1,
    limit = 3
  ) => {
    const response = await http.get(`/complaints/employee`, {
      params: { page, limit },
    });
    return response.data.data;
  },

  createComplaint: async (complaintAddRequest: ComplaintAddRequest) => {
    const response = await http.post("/complaints", complaintAddRequest);
    return response.data.data as ComplaintResponse;
  },

  recallComplaint: async (id: number) => {
    const response = await http.put(`/complaints/${id}/recall`);
    return response.data;
  },
  getPendingComplaints: async () => {
    const response = await http.get("/complaints/pending");
    return response.data;
  },

  approveComplaint: async (id: number, responseNote: string) => {
    const response = await http.put(`/complaints/${id}/approve`, {
      responseNote,
    });
    return response.data;
  },

  rejectComplaint: async (id: number, responseNote: string) => {
    const response = await http.put(`/complaints/${id}/reject`, {
      responseNote,
    });
    return response.data;
  },
};
