import http from "@/utils/http";

export const uploadApi = {
  upload: (formData: FormData) => {
    return http.post("/uploads/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};