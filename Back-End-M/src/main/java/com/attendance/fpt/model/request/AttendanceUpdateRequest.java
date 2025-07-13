package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
public class AttendanceUpdateRequest {
        @NotNull(message = "Location ID cannot be null")
        private String locationName;

        @NotNull(message = "checkInTime cannot be null")
        LocalTime checkInTime;

        @NotNull(message = "checkOutTime cannot be null")
        LocalTime checkOutTime;

        @NotBlank(message = "File cannot be null")
        private String file;
} 