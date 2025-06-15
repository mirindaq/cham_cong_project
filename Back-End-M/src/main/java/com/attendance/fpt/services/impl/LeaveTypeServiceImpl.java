package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.LeaveTypeConverter;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.entity.LeaveBalance;
import com.attendance.fpt.entity.LeaveType;
import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.LeaveTypeUpdateRequest;
import com.attendance.fpt.repositories.EmployeeRepository;
import com.attendance.fpt.repositories.LeaveBalanceRepository;
import com.attendance.fpt.repositories.LeaveTypeRepository;
import com.attendance.fpt.services.LeaveTypeService;
import com.attendance.fpt.model.request.LeaveTypeRequest;
import com.attendance.fpt.model.response.LeaveTypeResponse;
import com.attendance.fpt.utils.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class LeaveTypeServiceImpl implements LeaveTypeService {
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional
    public LeaveTypeResponse addLeaveType(LeaveTypeRequest leaveTypeRequest) {
        if (leaveTypeRepository.existsByName(leaveTypeRequest.getName())) {
            throw new ConflictException("Leave type already exists");
        }
        LeaveType leaveType = new LeaveType();
        leaveType.setName(leaveTypeRequest.getName());
        leaveType.setMaxDayPerYear(leaveTypeRequest.getMaxDayPerYear());
        leaveType.setActive(true);
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
    public List<LeaveTypeResponse> getAllLeaveTypesActive() {
        return leaveTypeRepository.findAll()
                .stream()
                .filter(LeaveType::isActive)
                .map(LeaveTypeConverter::toResponse)
                .toList();
    }

    @Override
    public List<LeaveTypeResponse> getAllLeaveTypes() {
        return leaveTypeRepository.findAll()
                .stream()
                .map(LeaveTypeConverter::toResponse)
                .toList();
    }


    @Override
    public List<LeaveTypeResponse> getLeaveTypeEnableInYear() {
        Employee employee = securityUtil.getCurrentUser();

        List<LeaveBalance> leaveBalances = leaveBalanceRepository.findAllByEmployee_IdAndYear(employee.getId(), LocalDate.now().getYear());

        List<LeaveType> rs = leaveBalances.stream()
                .map((item) -> (item.getRemainingDay() > 0 && item.getLeaveType().isActive()) ? item.getLeaveType() : null)
                .filter(Objects::nonNull)
                .toList();
        return rs.stream()
                .map(LeaveTypeConverter::toResponse)
                .toList();
    }

    @Override
    public LeaveTypeResponse updateStatus(Long leaveTypeId) {
        LeaveType leaveType = leaveTypeRepository.findById(leaveTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave type not exist"));

        leaveType.setActive(!leaveType.isActive());
        leaveTypeRepository.save(leaveType);
        return LeaveTypeConverter.toResponse(leaveType);
    }

    @Override
    public LeaveTypeResponse updateLeaveType(Long leaveTypeId, LeaveTypeUpdateRequest leaveTypeUpdateRequest) {
        LeaveType leaveType = leaveTypeRepository.findById(leaveTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave type not exist"));

        leaveType.setName(leaveTypeUpdateRequest.getName());
        leaveTypeRepository.save(leaveType);
        return LeaveTypeConverter.toResponse(leaveType);
    }
} 