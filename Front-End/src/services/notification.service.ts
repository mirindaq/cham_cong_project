import http from "@/utils/http";

export const notificationApi = {
  getAllNotifications: async (page = 1, limit = 3) => {
    const response = await http.get("/notifications/me", {
      params: { page, limit },
    });
    return response.data;
  },

  countUnreadNotificationsByEmployee: async () => {
    const response = await http.get("/notifications/me/unread/count");
    return response.data.data;
  },

  updateNotificationToRead: async (notificationId: number) => {
    const response = await http.put(`/notifications/me/${notificationId}/read`);
    return response.data;
  },

  updateAllNotificationsToReadByEmployee: async () => {
    const response = await http.put("/notifications/me/read");
    return response.data;
  },
};
