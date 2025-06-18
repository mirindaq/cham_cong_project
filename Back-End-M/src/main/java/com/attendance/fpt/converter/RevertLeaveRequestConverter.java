package com.attendance.fpt.converter;

import com.attendance.fpt.entity.RevertLeaveRequest;
import com.attendance.fpt.model.response.RevertLeaveRequestResponse;

public class RevertLeaveRequestConverter {

    public static RevertLeaveRequestResponse toResponse(RevertLeaveRequest revertLeaveRequest) {
        return RevertLeaveRequestResponse.builder()
                .id(revertLeaveRequest.getId())
                .date(revertLeaveRequest.getDate())
                .reason(revertLeaveRequest.getReason())
                .responseNote(revertLeaveRequest.getResponseNote())
                .responseDate(revertLeaveRequest.getResponseDate())
                .responseBy(revertLeaveRequest.getResponseBy() != null ? revertLeaveRequest.getResponseBy().getFullName() : null)
                .employeeName(revertLeaveRequest.getEmployee().getFullName())
                .departmentName(revertLeaveRequest.getEmployee().getDepartment().getName())
                .status(revertLeaveRequest.getStatus())
                .createdAt(revertLeaveRequest.getCreatedAt())
                .workShift(WorkShiftConverter.toResponse(revertLeaveRequest.getWorkShift()))
                .build();
    }
}
