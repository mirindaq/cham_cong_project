package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.NotificationResponseConverter;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.entity.Notification;
import com.attendance.fpt.model.response.NotificationResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.repositories.NotificationRepository;
import com.attendance.fpt.services.NotificationService;
import com.attendance.fpt.utils.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final SecurityUtil securityUtil;

    @Override
    public void sendNotification(Employee employee, String message ) {
        Notification notification = Notification.builder()
                .employee(employee)
                .content(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    public ResponseWithPagination<List<NotificationResponse>> getAllNotifications(int page, int limit) {
        Employee employee = securityUtil.getCurrentUser();
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, limit, sort);
        Page<Notification> notifications = notificationRepository.findAllByEmployee_Id(employee.getId(),pageable);
        Page<NotificationResponse> notificationResponses = notifications.map(NotificationResponseConverter::fromEntity);
        return ResponseWithPagination.<List<NotificationResponse>>builder()
                .data(notificationResponses.getContent())
                .totalItem((int) notifications.getTotalElements())
                .totalPage(notifications.getTotalPages())
                .limit(limit)
                .build();
    }

    @Override
    public long countUnreadNotificationsByEmployee() {
        Employee employee = securityUtil.getCurrentUser();
        return notificationRepository.countByEmployee_IdAndIsRead(employee.getId(),false);
    }

    @Override
    public void updateNotificationToRead(Long notificationId) {
        Employee employee = securityUtil.getCurrentUser();
        Notification notification = notificationRepository.findByIdAndEmployee_Id(notificationId, employee.getId())
                .orElseThrow(() -> new IllegalArgumentException("Notification not found or does not belong to the current user"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void updateAllNotificationsToReadByEmployee() {
        Employee employee = securityUtil.getCurrentUser();
        List<Notification> notifications = notificationRepository.findAllByEmployee_IdAndIsRead(employee.getId(), false);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }
}
