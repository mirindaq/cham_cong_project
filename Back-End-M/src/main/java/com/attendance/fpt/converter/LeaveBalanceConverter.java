package com.attendance.fpt.converter;

import com.attendance.fpt.entity.LeaveBalance;
import com.attendance.fpt.model.response.LeaveBalancePerEmployeeResponse;
import com.attendance.fpt.model.response.LeaveBalanceResponse;

public class LeaveBalanceConverter {

    public static LeaveBalanceResponse toResponse ( LeaveBalance leaveBalance) {
        return LeaveBalanceResponse.builder()
                .id(leaveBalance.getId())
                .usedDay(leaveBalance.getUsedDay())
                .year(leaveBalance.getYear())
                .remainingDay(leaveBalance.getRemainingDay())
                .leaveTypeName(leaveBalance.getLeaveType() != null ? leaveBalance.getLeaveType().getName() : null)
                .build();
    }

    public static LeaveBalancePerEmployeeResponse toResponsePerEmployee(LeaveBalance leaveBalance) {
        return LeaveBalancePerEmployeeResponse.builder()
                .id(leaveBalance.getId())
                .usedDay(leaveBalance.getUsedDay())
                .year(leaveBalance.getYear())
                .remainingDay(leaveBalance.getRemainingDay())
                .employeeName(leaveBalance.getEmployee() != null ? leaveBalance.getEmployee().getFullName() : null)
                .departmentName(leaveBalance.getEmployee() != null && leaveBalance.getEmployee().getDepartment() != null
                        ? leaveBalance.getEmployee().getDepartment().getName() : null)
                .leaveType(leaveBalance.getLeaveType() != null
                        ? LeaveTypeConverter.toResponse(leaveBalance.getLeaveType())
                        : null)
                .employeeEmail(leaveBalance.getEmployee().getEmail())
                .build();
    }
}
