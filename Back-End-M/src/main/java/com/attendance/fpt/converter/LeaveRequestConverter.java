package com.attendance.fpt.converter;

import com.attendance.fpt.entity.LeaveRequest;
import com.attendance.fpt.model.response.LeaveRequestResponse;

public class LeaveRequestConverter {

    public static LeaveRequestResponse toResponse(LeaveRequest leaveRequest) {
        return LeaveRequestResponse.builder()
                .id(leaveRequest.getId())
                .startDate(leaveRequest.getStartDate())
                .endDate(leaveRequest.getEndDate())
                .reason(leaveRequest.getReason())
                .responseNote(leaveRequest.getResponseNote())
                .responseDate(leaveRequest.getResponseDate())
                .responseBy(leaveRequest.getResponseBy() != null ? leaveRequest.getResponseBy().getFullName() : null)
                .employeeName(leaveRequest.getEmployee().getFullName())
                .leaveType(LeaveTypeConverter.toResponse(leaveRequest.getLeaveType()))
                .departmentName(leaveRequest.getEmployee().getDepartment() != null ? leaveRequest.getEmployee().getDepartment().getName() : null)
                .status(leaveRequest.getStatus())
                .createdAt(leaveRequest.getCreatedAt())
                .workShift(leaveRequest.getWorkShift() != null ? WorkShiftConverter.toResponse(leaveRequest.getWorkShift()) : null)
                .build();
    }

}
