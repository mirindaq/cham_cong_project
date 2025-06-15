package com.attendance.fpt.services;

import com.attendance.fpt.model.response.AttendanceWorkShiftResponse;
import com.attendance.fpt.model.response.LeaveBalancePerEmployeeResponse;
import com.attendance.fpt.model.response.LeaveBalanceResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;

import java.util.List;

public interface LeaveBalanceService {
    List<LeaveBalanceResponse> getLeaveBalanceByEmployee();

    ResponseWithPagination<List<LeaveBalancePerEmployeeResponse>>getAllLeaveBalance(
            String employeeName,
            Long year,
            Long departmentId,String leaveBalanceType, int page, int  limit);
} 