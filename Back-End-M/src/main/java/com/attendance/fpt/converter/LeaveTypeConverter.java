package com.attendance.fpt.converter;

import com.attendance.fpt.entity.LeaveType;
import com.attendance.fpt.model.response.LeaveTypeResponse;

public class LeaveTypeConverter {

    public static LeaveTypeResponse toResponse(LeaveType leaveType) {
        LeaveTypeResponse response = new LeaveTypeResponse();
        response.setId(leaveType.getId());
        response.setName(leaveType.getName());
        response.setMaxDayPerYear(leaveType.getMaxDayPerYear());
        response.setActive(leaveType.isActive());
        return response;
    }
}
