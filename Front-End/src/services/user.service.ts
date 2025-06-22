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

  getProfile: async () => {
    const response = await http.get(`/employees/profile`);
    return response.data;
  },

  updateUser: async (userId: number, userData: any) => {
    const response = await http.put(`/employees/update/${userId}`, userData);
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await http.put(`/employees/update-profile`, profileData);
    return response.data;
  },
  countAllUsers: async () => {
    const response = await http.get("/employees/count");
    return response.data;
  },

  getEmployeeToAssignment: async () => {
    const response = await http.get("/employees/employee-to-assignment");
    return response.data.data;
  },
  updateAvatar: async (file: any) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await http.put("/employees/update-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
