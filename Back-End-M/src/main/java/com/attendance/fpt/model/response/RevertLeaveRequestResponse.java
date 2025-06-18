package com.attendance.fpt.model.response;

import com.attendance.fpt.enums.RevertLeaveRequestStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class RevertLeaveRequestResponse {
    private Long id;
    private LocalDate date;
    private String reason;
    private String responseNote;
    private LocalDateTime responseDate;
    private String responseBy;
    private String employeeName;
    private String departmentName;
    private RevertLeaveRequestStatus status;
    private LocalDateTime createdAt;
    private WorkShiftResponse workShift;
}
