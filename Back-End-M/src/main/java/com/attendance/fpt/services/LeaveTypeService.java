package com.attendance.fpt.services;

import com.attendance.fpt.model.request.LeaveTypeRequest;
import com.attendance.fpt.model.response.LeaveTypeResponse;

import java.util.List;

public interface LeaveTypeService {
    LeaveTypeResponse addLeaveType(LeaveTypeRequest leaveTypeRequest);

    List<LeaveTypeResponse> getAllLeaveTypes();
}