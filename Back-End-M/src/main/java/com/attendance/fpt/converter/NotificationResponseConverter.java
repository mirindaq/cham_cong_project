package com.attendance.fpt.converter;

import com.attendance.fpt.entity.Notification;
import com.attendance.fpt.model.response.NotificationResponse;

public class NotificationResponseConverter {

    public static NotificationResponse fromEntity(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .content(notification.getContent())
                .createdAt(notification.getCreatedAt())
                .employeeId(notification.getEmployee() != null ? notification.getEmployee().getId() : null)
                .isRead(notification.getIsRead())

                .build();
    }
}
