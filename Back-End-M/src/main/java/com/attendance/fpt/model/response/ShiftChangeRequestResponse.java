package com.attendance.fpt.model.response;

import com.attendance.fpt.enums.ShiftChangeRequestStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ShiftChangeRequestResponse {
    private Long id;

    private LocalDate date;

    private String reason;

    private String responseNote;

    private LocalDateTime responseDate;
    private WorkShiftResponse workShift;

    private String employeeName;
    private String departmentName;

    private String targetEmployeeName;
    private String targetDepartmentName;
    private String responseBy;
    private ShiftChangeRequestStatus status;
    private LocalDateTime createdAt;
}
