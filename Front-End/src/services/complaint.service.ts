import type {
  ComplaintAddRequest,
  ComplaintResponse,
} from "@/types/complaint.type";
import http from "@/utils/http";

export const complaintApi = {
  getAllComplaints: async (page = 1, size = 10) => {
    const response = await http.get(`/complaints`, {
      params: { page, size },
    });
    return response.data.data;
  },

  getAllComplaintsByEmployee: async (
    employeeId: number,
    page = 1,
    size = 3
  ) => {
    console.log(page);
    const response = await http.get(`/complaints/employee/${employeeId}`, {
      params: { page, size },
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
    const response = await http.get('/complaints/pending');
    return response.data;
  }
};
