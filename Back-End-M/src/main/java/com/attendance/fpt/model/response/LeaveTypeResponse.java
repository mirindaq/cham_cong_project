package com.attendance.fpt.model.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaveTypeResponse {
    private Long id;
    private String name;
    private Integer maxDayPerYear;
} 