package com.attendance.fpt.converter;

import com.attendance.fpt.entity.Complaint;
import com.attendance.fpt.model.response.ComplaintResponse;

public class ComplaintsConverter {

    public static ComplaintResponse toResponse(Complaint complaint){
        return ComplaintResponse.builder()
                .id(complaint.getId())
                .reason(complaint.getReason())
                .responseDate(complaint.getResponseDate())
                .date(complaint.getDate())
                .responseNote(complaint.getResponseNote())
                .responseByFullName(complaint.getResponseBy() != null ? complaint.getResponseBy().getFullName() : null)
                .employeeFullName(complaint.getEmployee().getFullName())
                .status(complaint.getStatus())
                .complaintType(complaint.getComplaintType() != null ? complaint.getComplaintType().getDisplayName() : null)
                .createdAt(complaint.getCreatedAt())
                .departmentName(complaint.getEmployee().getDepartment() != null ? complaint.getEmployee().getDepartment().getName() : null)
                .build();

    }
}
