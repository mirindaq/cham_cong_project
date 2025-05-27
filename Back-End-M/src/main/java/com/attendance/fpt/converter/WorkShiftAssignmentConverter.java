package com.attendance.fpt.converter;

import com.attendance.fpt.entity.WorkShiftAssignment;
import com.attendance.fpt.model.response.WorkShiftAssignmentResponse;

public class WorkShiftAssignmentConverter {

    public static WorkShiftAssignmentResponse toResponse(WorkShiftAssignment workShiftAssignment) {
        return WorkShiftAssignmentResponse.builder()
                .id(workShiftAssignment.getId())
                .dateAssign(workShiftAssignment.getDateAssign())
                .workShift(WorkShiftConverter.toResponse(workShiftAssignment.getWorkShift()))
                .employeeId(workShiftAssignment.getEmployee().getId())
                .employeeName(workShiftAssignment.getEmployee().getFullName())
                .employeeDepartmentName(workShiftAssignment.getEmployee().getDepartment().getName())
                .build();
    }
}
