package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeAddRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;
    @NotBlank(message = "Email is required")
    private String email;
    @NotBlank(message = "Phone number is required")
    private String phone;
    @NotBlank(message = "Address is required")
    private String address;
    @NotNull(message = "Department ID is required")
    private Long departmentId;
    @NotBlank(message = "Position is required")
    private String position;
    @NotBlank(message = "Employee type is required")
    private String employeeType;
    @NotBlank(message = "Role is required")
    private String role;
    private boolean active;
    @NotNull(message = "Date of birth is required")
    private LocalDate dob;
    @NotNull(message = "Join date is required")
    private LocalDate joinDate;
}
