package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class CheckInRequest {
        @NotNull(message = "Location ID cannot be null")
        private Long locationId;
        @NotNull(message = "Check-in time cannot be null")
        private Double latitude;
        @NotNull(message = "Check-in time cannot be null")
        private Double longitude;
        @NotBlank(message = "File cannot be null")
        private String file;
} 