package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ComplaintAddRequest {
    @NotNull
    private Long employeeId;

    @NotBlank(message = "reason is required")
    private String reason;

    @NotNull(message = "date is required")
    private LocalDate date;

    @NotNull(message = "complaintType is required")
    private String complaintType;

    @NotBlank(message = "requestChange is required")
    private String requestChange;


}
