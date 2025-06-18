package com.attendance.fpt.converter;

import com.attendance.fpt.entity.PartTimeRequest;
import com.attendance.fpt.model.response.PartTimeRequestResponse;

public class PartTimeRequestConverter {

    public static PartTimeRequestResponse toResponse(PartTimeRequest partTimeRequest) {
        return PartTimeRequestResponse.builder()
                .date(partTimeRequest.getDate())
                .employeeName(partTimeRequest.getEmployee().getFullName())
                .departmentName(partTimeRequest.getEmployee().getDepartment().getName())
                .responseDate(partTimeRequest.getResponseDate())
                .responseBy(partTimeRequest.getResponseBy() != null ? partTimeRequest.getResponseBy().getFullName() : null)
                .responseNote(partTimeRequest.getResponseNote())
                .status(partTimeRequest.getStatus())
                .createdAt(partTimeRequest.getCreatedAt())
                .workShift(WorkShiftConverter.toResponse(partTimeRequest.getWorkShift()))
                .id(partTimeRequest.getId())
                .build();
    }
}
