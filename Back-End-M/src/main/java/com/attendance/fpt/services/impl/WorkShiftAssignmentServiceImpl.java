package com.attendance.fpt.services.impl;


import com.attendance.fpt.converter.WorkShiftAssignmentConverter;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.entity.WorkShift;
import com.attendance.fpt.entity.WorkShiftAssignment;
import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.WorkShiftAssignmentListRequest;
import com.attendance.fpt.model.request.WorkShiftAssignmentRequest;
import com.attendance.fpt.model.response.WorkShiftAssignmentResponse;
import com.attendance.fpt.repositories.EmployeeRepository;
import com.attendance.fpt.repositories.WorkShiftAssignmentRepository;
import com.attendance.fpt.repositories.WorkShiftRepository;
import com.attendance.fpt.services.WorkShiftAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkShiftAssignmentServiceImpl implements WorkShiftAssignmentService {

    private final WorkShiftAssignmentRepository workShiftAssignmentRepository;
    private final WorkShiftRepository workShiftRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public List<WorkShiftAssignmentResponse> getAllAssignments( Long employeeId, Long workShiftId, Long month, Long year, Long departmentId) {
        return workShiftAssignmentRepository.filterAssignments( employeeId, workShiftId, month, year, departmentId).stream()
                .map(WorkShiftAssignmentConverter::toResponse)
                .collect(Collectors.toList());
    }



    @Override
    @Transactional
    public List<WorkShiftAssignmentResponse> addListAssignments(WorkShiftAssignmentListRequest request) {
        return request.getWorkShiftAssignments().stream()
                .map(this::addSingleAssignment)
                .toList();
    }

    @Override
    public void deleteAssignment(Long employeeId, Long workShiftAssignmentId) {
        WorkShiftAssignment assignment = workShiftAssignmentRepository.findById(workShiftAssignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Work shift assignment not found"));

        if (!assignment.getEmployee().getId().equals(employeeId)) {
            throw new ConflictException("Employee ID does not match the assignment");
        }

        if ( assignment.getDateAssign().isBefore(java.time.LocalDate.now())) {
            throw new ConflictException("Cannot delete past assignments");
        }

        if ( assignment.getAttendance() != null) {
            throw new ConflictException("Cannot delete assignment with attendance record");
        }

        workShiftAssignmentRepository.delete(assignment);
    }


    private WorkShiftAssignmentResponse addSingleAssignment( WorkShiftAssignmentRequest request){
        WorkShift workShift = workShiftRepository.findById(request.getWorkShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Work shift not found"));

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        if (request.getDateAssign().isBefore(LocalDate.now())) {
            throw new ConflictException("Cannot assign work shift in the past");
        }

        if (!workShiftAssignmentRepository.existsOverlappingAssignments(employee.getId(), request.getDateAssign(),
                workShift.getStartTime(), workShift.getEndTime()).isEmpty()) {
            throw new ConflictException("Work shift assignment already exists for this date");
        }


        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .dateAssign(request.getDateAssign())
                .workShift(workShift)
                .employee(employee)
                .build();
        return WorkShiftAssignmentConverter.toResponse(workShiftAssignmentRepository.save(assignment));
    }


} 