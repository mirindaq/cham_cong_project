package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkShiftRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotNull(message = "Start time is required")
    private String startTime;
    
    @NotNull(message = "End time is required")
    private String endTime;
    @NotNull(message = "partTime is required")
    private boolean partTime;
    @NotNull(message = "active is required")
    private boolean active;

} 