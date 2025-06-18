package com.attendance.fpt.model.response;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class NotificationResponse {
    private Long id;
    private String content;
    private Boolean isRead;
    private Long employeeId;
    private LocalDateTime createdAt;
    private String type;
}
