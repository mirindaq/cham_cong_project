import axios from "axios";
import { API_URL } from "@/config/constants";

export const employeeApi = {
  getEmployeeById: async (employeeId: number) => {
    const response = await axios.get(`${API_URL}/api/employee/profile/${employeeId}`);
    return response.data;
  },
}; 