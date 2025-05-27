package com.attendance.fpt.converter;

import com.attendance.fpt.entity.LeaveBalance;
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
}
