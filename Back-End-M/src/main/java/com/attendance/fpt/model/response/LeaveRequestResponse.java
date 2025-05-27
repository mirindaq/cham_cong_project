package com.attendance.fpt.model.response;

import com.attendance.fpt.enums.LeaveRequestStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class LeaveRequestResponse {
    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String responseNote;
    private LocalDateTime responseDate;
    private String responseBy;
    private String employeeName;
    private LeaveTypeResponse leaveType;
    private LeaveRequestStatus status;
} 