package com.attendance.fpt.model.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class WorkShiftAssignmentResponse {
    private Long id;
    private LocalDate dateAssign;
    private WorkShiftResponse workShift;
    private Long employeeId;
    private String employeeName;
    private String employeeDepartmentName;
    private Long attendanceId;
} 