package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ShiftChangeAddRequest {
    @NotNull( message = "date is required")
    private LocalDate date;

    @NotBlank(message = "targetEmployeeEmail is required")
    private String targetEmployeeEmail;

    @NotBlank(message = "reason is required")
    private String reason;

    @NotNull(message = "workShiftId is required")
    private Long workShiftId;
}
