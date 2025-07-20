package com.attendance.fpt.model.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class OverallStatisticEmployeeYearResponse {
    private String month;
    private int present;
    private int absent;
    private int late;
    private int leave;
    private int total;
}
