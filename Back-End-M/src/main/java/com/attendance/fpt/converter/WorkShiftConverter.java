package com.attendance.fpt.converter;

import com.attendance.fpt.entity.WorkShift;
import com.attendance.fpt.model.response.WorkShiftResponse;

public class WorkShiftConverter {

    public static WorkShiftResponse toResponse(WorkShift workShift) {
        return WorkShiftResponse.builder()
                .name(workShift.getName())
                .startTime(workShift.getStartTime())
                .endTime(workShift.getEndTime())
                .id(workShift.getId())
                .isPartTime(workShift.isPartTime())
                .active(workShift.isActive())
                .build();
    }
}
