package com.attendance.fpt.converter;

import com.attendance.fpt.entity.PartTimeRequest;
import com.attendance.fpt.entity.RemoteWorkRequest;
import com.attendance.fpt.model.response.PartTimeRequestResponse;
import com.attendance.fpt.model.response.RemoteWorkRequestResponse;

public class RemoteWorkRequestConverter {

    public static RemoteWorkRequestResponse toResponse(RemoteWorkRequest remoteWorkRequest) {
        return RemoteWorkRequestResponse.builder()
                .date(remoteWorkRequest.getDate())
                .employeeName(remoteWorkRequest.getEmployee().getFullName())
                .departmentName(remoteWorkRequest.getEmployee().getDepartment().getName())
                .responseDate(remoteWorkRequest.getResponseDate())
                .responseBy(remoteWorkRequest.getResponseBy() != null ? remoteWorkRequest.getResponseBy().getFullName() : null)
                .responseNote(remoteWorkRequest.getResponseNote())
                .status(remoteWorkRequest.getStatus())
                .createdAt(remoteWorkRequest.getCreatedAt())
                .workShift(WorkShiftConverter.toResponse(remoteWorkRequest.getWorkShift()))
                .reason(remoteWorkRequest.getReason())
                .id(remoteWorkRequest.getId())
                .build();
    }
}
