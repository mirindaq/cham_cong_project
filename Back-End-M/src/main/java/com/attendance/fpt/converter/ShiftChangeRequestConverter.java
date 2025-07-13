package com.attendance.fpt.converter;

import com.attendance.fpt.entity.ShiftChangeRequest;
import com.attendance.fpt.enums.ShiftChangeRequestStatus;
import com.attendance.fpt.model.response.ShiftChangeRequestResponse;

public class ShiftChangeRequestConverter {

    public static ShiftChangeRequestResponse toResponse(ShiftChangeRequest shiftChangeRequest) {
        return ShiftChangeRequestResponse.builder()
                .date(shiftChangeRequest.getDate())
                .reason(shiftChangeRequest.getReason())
                .responseNote(shiftChangeRequest.getResponseNote() != null ? shiftChangeRequest.getResponseNote() : "")
                .responseDate(shiftChangeRequest.getResponseDate() != null ? shiftChangeRequest.getResponseDate() : null)
                .workShift(WorkShiftConverter.toResponse(shiftChangeRequest.getWorkShift()))
                .employeeName(shiftChangeRequest.getEmployee().getFullName())
                .targetEmployeeName(shiftChangeRequest.getTargetEmployee().getFullName())
                .responseBy(shiftChangeRequest.getResponseBy() != null ? shiftChangeRequest.getResponseBy().getFullName() : "")
                .status(shiftChangeRequest.getStatus())
                .id(shiftChangeRequest.getId())
                .createdAt(shiftChangeRequest.getCreatedAt())
                .departmentName(shiftChangeRequest.getEmployee().getDepartment() != null ? shiftChangeRequest.getEmployee().getDepartment().getName() : "")
                .targetDepartmentName(shiftChangeRequest.getTargetEmployee().getDepartment() != null ? shiftChangeRequest.getTargetEmployee().getDepartment().getName() : "")
                .build();
    }

}
