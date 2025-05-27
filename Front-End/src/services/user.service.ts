import http from "@/utils/http";

export const userApi = {
  getAllUsers: async (dataFilter: any) => {
    const response = await http.get("/employees", { params: dataFilter });
    return response.data.data;
  },

  addUser: async (userData: any) => {
    const response = await http.post("/employees/add", userData);
    return response.data;
  },

  getProfile: async (employeeId: number) => {
    const response = await http.get(`/employees/profile/${employeeId}`);
    return response.data;
  },

  updateUser: async (userId: number, userData: any) => {
    const response = await http.put(`/employees/update/${userId}`, userData);
    return response.data;
  },
};
