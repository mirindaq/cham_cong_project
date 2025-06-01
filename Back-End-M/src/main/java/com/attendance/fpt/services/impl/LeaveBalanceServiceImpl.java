package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.LeaveBalanceConverter;
import com.attendance.fpt.entity.LeaveBalance;
import com.attendance.fpt.model.response.LeaveBalanceResponse;
import com.attendance.fpt.repositories.LeaveBalanceRepository;
import com.attendance.fpt.services.LeaveBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveBalanceServiceImpl implements LeaveBalanceService {
    private final LeaveBalanceRepository leaveBalanceRepository;

    @Override
    public List<LeaveBalanceResponse> getLeaveBalanceByEmployeeId(Long employeeId) {
        List<LeaveBalance> leaveBalance = leaveBalanceRepository.findByEmployee_Id(employeeId);

        if (leaveBalance.isEmpty()) {
            return List.of();
        }
        return leaveBalance.stream()
                .map(LeaveBalanceConverter::toResponse)
                .toList();
    }
}