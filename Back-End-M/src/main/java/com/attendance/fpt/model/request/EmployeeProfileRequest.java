package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeProfileRequest {
    @NotBlank(message = "Phone number is required")
    private String phone;
    @NotBlank(message = "Address is required")
    private String address;
    @NotNull(message = "Date of birth is required")
    private LocalDate dob;

}
