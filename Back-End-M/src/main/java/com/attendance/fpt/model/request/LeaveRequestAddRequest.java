package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class LeaveRequestAddRequest {
    @NotNull
    private Long employeeId;

    @NotNull( message = "startDate is required")
    private LocalDate startDate;

    @NotNull( message = "endDate is required")
    private LocalDate endDate;

    @NotBlank(message = "reason is required")
    private String reason;

    @NotNull(message = "leaveTypeId is required")
    private Long leaveTypeId;
}
