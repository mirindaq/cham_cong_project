package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.ComplaintsConverter;
import com.attendance.fpt.converter.LeaveBalanceConverter;
import com.attendance.fpt.entity.Attendance;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.entity.LeaveBalance;
import com.attendance.fpt.enums.AttendanceStatus;
import com.attendance.fpt.model.response.*;
import com.attendance.fpt.repositories.LeaveBalanceRepository;
import com.attendance.fpt.services.LeaveBalanceService;
import com.attendance.fpt.utils.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveBalanceServiceImpl implements LeaveBalanceService {
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final SecurityUtil securityUtil;
    @Override
    public List<LeaveBalanceResponse> getLeaveBalanceByEmployee() {
        Employee employee = securityUtil.getCurrentUser();
        List<LeaveBalance> leaveBalance = leaveBalanceRepository.findByEmployeeIdActive(employee.getId());

        if (leaveBalance.isEmpty()) {
            return List.of();
        }
        return leaveBalance.stream()
                .map(LeaveBalanceConverter::toResponse)
                .toList();
    }

    @Override
    public ResponseWithPagination<List<LeaveBalancePerEmployeeResponse>> getAllLeaveBalance(String employeeName,
                                                                                       Long year, Long departmentId,String leaveBalanceType, int page, int limit) {

        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<LeaveBalance> leaveBalances = leaveBalanceRepository.getAllLeaveBalanceByFilter( employeeName, year,
                departmentId,leaveBalanceType ,pageable);


        Page<LeaveBalancePerEmployeeResponse> responsePage = leaveBalances.map(LeaveBalanceConverter::toResponsePerEmployee);

        return ResponseWithPagination.<List<LeaveBalancePerEmployeeResponse>>builder()
                .data(responsePage.getContent())
                .totalItem((int) responsePage.getTotalElements())
                .totalPage(responsePage.getTotalPages())
                .limit(limit)
                .page(page)
                .build();
    }
}