package com.attendance.fpt.model.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class TopStaffAttendanceResponse {
    private Long employeeId;
    private String employeeName;
    private String departmentName;
    private Long totalWorkShiftAssignment;
    private Long totalAttendanceWorkShift;
    private Long totalLateWorkShift;
    private Long totalAbsentWorkShift;
    private Long totalLeaveWorkShift;
    private Double totalWorkingHours;
}
