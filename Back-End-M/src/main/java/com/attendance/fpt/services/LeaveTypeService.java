package com.attendance.fpt.services;

import com.attendance.fpt.model.request.LeaveTypeRequest;
import com.attendance.fpt.model.response.LeaveTypeResponse;

import java.time.LocalDate;
import java.util.List;

public interface LeaveTypeService {
    LeaveTypeResponse addLeaveType(LeaveTypeRequest leaveTypeRequest);

    List<LeaveTypeResponse> getAllLeaveTypes();

    List<LeaveTypeResponse> getLeaveTypeEnableInYear(Long employeeId);
}