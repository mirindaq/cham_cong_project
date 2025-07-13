package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class WorkShiftAssignmentRequest {
    @NotNull(message = "Date assign is required")
    private LocalDate dateAssign;
    
    @NotNull(message = "Work shift id is required")
    private Long workShiftId;
    
    @NotNull(message = "Employee id is required")
    private Long employeeId;
} 