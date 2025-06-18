package com.attendance.fpt.model.response;

import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@Builder
public class WorkShiftResponse {
    private Long id;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean isPartTime;
    private boolean active;
}