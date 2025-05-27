package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.LeaveTypeConverter;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.entity.LeaveBalance;
import com.attendance.fpt.entity.LeaveType;
import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.repositories.EmployeeRepository;
import com.attendance.fpt.repositories.LeaveBalanceRepository;
import com.attendance.fpt.repositories.LeaveTypeRepository;
import com.attendance.fpt.services.LeaveTypeService;
import com.attendance.fpt.model.request.LeaveTypeRequest;
import com.attendance.fpt.model.response.LeaveTypeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveTypeServiceImpl implements LeaveTypeService {
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public LeaveTypeResponse addLeaveType(LeaveTypeRequest leaveTypeRequest) {
        if ( leaveTypeRepository.existsByName(leaveTypeRequest.getName())) {
            throw new ConflictException("Leave type already exists");
        }
        LeaveType leaveType = new LeaveType();
        leaveType.setName(leaveTypeRequest.getName());
        leaveType.setMaxDayPerYear(leaveTypeRequest.getMaxDayPerYear());
        leaveType = leaveTypeRepository.save(leaveType);

        List<Employee> employees = employeeRepository.findAll();
        for (Employee employee : employees) {
            LeaveBalance leaveBalance = new LeaveBalance();
            leaveBalance.setEmployee(employee);
            leaveBalance.setLeaveType(leaveType);
            leaveBalance.setUsedDay(0);
            leaveBalance.setRemainingDay(leaveTypeRequest.getMaxDayPerYear());
            leaveBalance.setYear(LocalDate.now().getYear());
            leaveBalanceRepository.save(leaveBalance);
        }

        return LeaveTypeConverter.toResponse(leaveType);
    }

    @Override
    public List<LeaveTypeResponse> getAllLeaveTypes() {
        List<LeaveType> leaveTypes = leaveTypeRepository.findAll();
        return leaveTypes.stream()
                .map(LeaveTypeConverter::toResponse)
                .toList();
    }
} 