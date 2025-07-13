package com.attendance.fpt.model.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OverallStatisticMonthResponse {
    private String name;
    private int present;
    private int absent;
    private int late;
    private int leave;
    private int total;
}
