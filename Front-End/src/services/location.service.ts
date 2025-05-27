import type { Location } from "@/types/location.type";
import http from "@/utils/http";

export const locationApi = {
  getAllLocations: async () => {
    const response = await http.get("/locations");
    return response.data.data;
  },

  addLocation: async (newLocation: Omit<Location, "id">) => {
    const response = await http.post("/locations/add", newLocation);
    return response.data.data;
  },

  updateLocation: async (id: number, locationData: any) => {
    const response = await http.put(`/locations/update/${id}`, locationData);
    return response.data.data;
  },
  deleteLocation: async (id: number) => {
    const response = await http.delete(`/locations/delete/${id}`);
    return response.data.data;
  },

  getAllLocationsActive: async () => {
    const response = await http.get("/locations/active");
    return response.data.data;
  },
};
