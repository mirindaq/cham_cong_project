package com.attendance.fpt.services;

import com.attendance.fpt.model.response.LeaveBalanceResponse;

import java.util.List;

public interface LeaveBalanceService {
    List<LeaveBalanceResponse> getLeaveBalanceByEmployeeId(Long employeeId);
} 