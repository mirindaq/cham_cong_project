package com.attendance.fpt.services;

import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.model.response.NotificationResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;

import java.util.List;

public interface NotificationService {
    void sendNotification(Employee employee, String message);

    ResponseWithPagination<List<NotificationResponse>> getAllNotifications(int page, int limit);

    long countUnreadNotificationsByEmployee();

    void updateNotificationToRead(Long notificationId);

    void updateAllNotificationsToReadByEmployee();
}
