
import type { RemoteWorkRequestAddRequest, RemoteWorkRequestHandleRequest } from "@/types/remoteWorkRequest.type";
import http from "@/utils/http";

export const remoteWorkRequestApi = {
  // Lấy tất cả yêu cầu từ xa (admin)
  getAllRemoteWorkRequests: async (params: any) => {
    const response = await http.get("/remote-work-requests", { params });
    return response.data.data;
  },

  // Lấy yêu cầu từ xa của nhân viên hiện tại
  getAllRemoteWorkRequestsByEmployee: async (page = 1, size = 3) => {
    const response = await http.get("/remote-work-requests/employee", {
      params: { page, size },
    });
    return response.data.data;
  },

  // Tạo mới yêu cầu từ xa (employee)
  createRemoteWorkRequest: async (data: RemoteWorkRequestAddRequest) => {
    const response = await http.post("/remote-work-requests", data);
    return response.data;
  },

  // Thu hồi yêu cầu từ xa (employee)
  recallRemoteWorkRequest: async (id: number) => {
    const response = await http.put(`/remote-work-requests/${id}/recall`);
    return response.data;
  },

  // Duyệt yêu cầu từ xa (admin)
  approveRemoteWorkRequest: async (id: number, data: RemoteWorkRequestHandleRequest) => {
    const response = await http.put(`/remote-work-requests/${id}/approve`, data);
    return response.data;
  },

  // Từ chối yêu cầu từ xa (admin)
  rejectRemoteWorkRequest: async (id: number, data: RemoteWorkRequestHandleRequest) => {
    const response = await http.put(`/remote-work-requests/${id}/reject`, data);
    return response.data;
  },
};
