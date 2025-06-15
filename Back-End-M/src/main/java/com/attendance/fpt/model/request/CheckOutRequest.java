package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckOutRequest {
    @NotNull(message = "Attendance ID cannot be null")
    private Long attendanceId;
} 