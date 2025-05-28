package com.attendance.fpt.model.response;

import com.attendance.fpt.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ComplaintResponse {
    private Long id;
    private String reason;
    private LocalDateTime responseDate;
    private LocalDate date;
    private String responseNote;
    private String responseByFullName;
    private String employeeFullName;
    private String complaintType;
    private String departmentName;
    private LocalDateTime createdAt;
    private ComplaintStatus status;
}
