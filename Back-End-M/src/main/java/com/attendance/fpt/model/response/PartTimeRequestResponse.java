package com.attendance.fpt.model.response;

import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.entity.WorkShift;
import com.attendance.fpt.enums.PartTimeRequestStatus;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class PartTimeRequestResponse {
    private Long id;
    private LocalDate date;
    private String employeeName;
    private String departmentName;
    private LocalDateTime responseDate;
    private String responseBy;
    private String responseNote;
    private PartTimeRequestStatus status;
    private WorkShiftResponse workShift;
    private LocalDateTime createdAt;
}
