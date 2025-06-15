package com.attendance.fpt.model.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class AttendanceDailyResponse {
    private LocalDate date;
    private Long present;
    private Long absent;
    private Long late;
    private Long leave;
    private Long total;
}
