package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.WorkShiftConverter;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.entity.WorkShift;
import com.attendance.fpt.enums.AttendanceStatus;
import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.WorkShiftRequest;
import com.attendance.fpt.model.response.WorkShiftResponse;
import com.attendance.fpt.repositories.WorkShiftRepository;
import com.attendance.fpt.services.WorkShiftService;
import com.attendance.fpt.utils.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkShiftServiceImpl implements WorkShiftService {

    private final WorkShiftRepository workShiftRepository;
    private final SecurityUtil securityUtil;

    @Override
    public List<WorkShiftResponse> getAllWorkShifts() {
        return workShiftRepository.findAll().stream()
                .map(WorkShiftConverter::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public WorkShiftResponse addWorkShift(WorkShiftRequest workShiftRequest) {
        WorkShift workShift = new WorkShift();
        workShift.setName(workShiftRequest.getName());
        workShift.setStartTime(LocalTime.parse(workShiftRequest.getStartTime()));
        workShift.setEndTime(LocalTime.parse(workShiftRequest.getEndTime()));
        workShift.setPartTime(workShiftRequest.isPartTime());
        workShift.setActive(workShiftRequest.isActive());
        return WorkShiftConverter.toResponse(workShiftRepository.save(workShift));
    }

    @Override
    public WorkShiftResponse deleteWorkShift(Long id) {
        WorkShift workShift = workShiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work shift not found"));

        if (workShiftRepository.workShiftHaveAssignments(id)) {
            throw new ConflictException("Cannot delete work shift with existing assignments");
        }
        workShiftRepository.delete(workShift);
        return WorkShiftConverter.toResponse(workShift);
    }

    @Override
    public List<WorkShiftResponse> getAllWorkShiftsPartTimeActive() {
        return workShiftRepository.findAllByPartTimeAndActive(true,true).stream()
                .map(WorkShiftConverter::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkShiftResponse> getAllWorkShiftsPartTime() {
        return workShiftRepository.findAllByPartTime(true).stream()
                .map(WorkShiftConverter::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkShiftResponse> getAllWorkShiftsActive() {
        return workShiftRepository.findAllByActive(true).stream()
                .map(WorkShiftConverter::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public WorkShiftResponse updateStatus(Long workShiftId) {
        WorkShift workShift = workShiftRepository.findById(workShiftId).orElseThrow(() -> new ResourceNotFoundException("Work shift not found"));
        workShift.setActive(!workShift.isActive());
        return WorkShiftConverter.toResponse(workShiftRepository.save(workShift));
    }

    @Override
    public List<WorkShiftResponse> getWorkShiftsByEmployeeBetweenDate(LocalDate startDate, LocalDate endDate) {
        Employee employee = securityUtil.getCurrentUser();

        List<WorkShift> workShifts = workShiftRepository.findByEmployeeIdAndDateBetween(employee.getId(), startDate, endDate);

        if (workShifts != null && !workShifts.isEmpty()) {
            return workShifts.stream()
                    .map(WorkShiftConverter::toResponse)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    @Override
    public List<WorkShiftResponse> getWorkShiftsByEmployeeByDate(LocalDate date) {
        Employee employee = securityUtil.getCurrentUser();

        List<WorkShift> workShifts = workShiftRepository.
                findByEmployeeIdAndDateAndAttendanceStatus(employee.getId(), date, AttendanceStatus.LEAVE);

        if (workShifts != null && !workShifts.isEmpty()) {
            return workShifts.stream()
                    .map(WorkShiftConverter::toResponse)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

}