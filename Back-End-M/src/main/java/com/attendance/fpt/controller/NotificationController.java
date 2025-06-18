package com.attendance.fpt.controller;

import com.attendance.fpt.model.response.NotificationResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<NotificationResponse>>>> getAllNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int limit) {

        return ResponseEntity.ok(
                new ResponseSuccess<>(HttpStatus.OK,
                        "Get all student notifications successfully",
                        notificationService.getAllNotifications(page, limit)));
    }

    @GetMapping("/me/unread/count")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<Long>> countUnreadNotificationsByEmployee() {
        long count = notificationService.countUnreadNotificationsByEmployee();
        return ResponseEntity.ok(
                new ResponseSuccess<>(HttpStatus.OK,
                        "Count unread notifications successfully",
                        count));
    }

    @PutMapping("/me/{notificationId}/read")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<Void>> updateNotificationToRead(@PathVariable Long notificationId) {
        notificationService.updateNotificationToRead(notificationId);
        return ResponseEntity.ok(
                new ResponseSuccess<>(HttpStatus.OK,
                        "Update notification to read successfully",
                        null));
    }

    @PutMapping("/me/read")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<Void>> updateAllNotificationsToReadByEmployee() {
        notificationService.updateAllNotificationsToReadByEmployee();
        return ResponseEntity.ok(
                new ResponseSuccess<>(HttpStatus.OK,
                        "Update all notifications to read successfully",
                        null));
    }
}
