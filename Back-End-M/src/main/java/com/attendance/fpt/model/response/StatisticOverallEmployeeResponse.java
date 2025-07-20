package com.attendance.fpt.model.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatisticOverallEmployeeResponse {
    private int totalWorkShiftAssigned;
    private int onTimeCount;
    private double totalWorkingHours;
}
