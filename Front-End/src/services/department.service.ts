import http from "@/utils/http";

export const departmentApi = {
  getAllDepartments: async () => {
    try {
      const response = await http.get("/departments");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng ban:", error);
      return null;
    }
  },

  addDepartment: async (department: { name: string }) => {
    try {
      const response = await http.post("/departments/add", department);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi thêm phòng ban:", error);
      return null;
    }
  },

  updateDepartment: async (
    id: number,
    department: { id: number; name: string }
  ) => {
    try {
      const response = await http.put(`/departments/update/${id}`, department);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật phòng ban:", error);
      return null;
    }
  },

  deleteDepartment: async (departmentId: number) => {
    try {
      const response = await http.delete(`/departments/delete/${departmentId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa phòng ban:", error);
      return null;
    }
  }
};
