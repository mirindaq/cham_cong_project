package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PartTimeRequestAddRequest {
    @NotNull( message = "date is required")
    private LocalDate date;

    @NotNull(message = "workShiftId is required")
    private Long workShiftId;
}
