package com.attendance.fpt.model.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
public class AttendanceWeeklyResponse {
    private LocalDate currentDate;
    private List<AttendanceDailyResponse> attendanceOfWeek;

}
