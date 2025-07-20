package com.attendance.fpt.model.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RemoteWorkRequestAddRequest {

    @NotNull(message = "date is required")
    @FutureOrPresent(message = "date must be today or in the future")
    private LocalDate date;

    @NotNull(message = "workShiftId is required")
    private Long workShiftId;

    @NotBlank(message = "reason is required")
    private String reason;
}
