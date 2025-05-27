package com.attendance.fpt.model.response;

import com.attendance.fpt.enums.AttendanceStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AttendanceWorkShiftResponse {
    private WorkShiftAssignmentResponse workShifts;
    private LocalDate date;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private Long attendanceId;
    private String locationName;
    private String status;

}
