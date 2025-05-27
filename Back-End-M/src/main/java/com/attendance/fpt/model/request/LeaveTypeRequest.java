package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaveTypeRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotNull(message = "Max day per year is required")
    private Integer maxDayPerYear;
} 