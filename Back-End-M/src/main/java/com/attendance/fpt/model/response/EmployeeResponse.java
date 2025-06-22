package com.attendance.fpt.model.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
public class EmployeeResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String departmentName;
    private String position;
    private String role;
    private LocalDate dob;
    private LocalDate joinDate;
    private String employeeType;
    private boolean active;
    private String avatar;
    private List<LeaveBalanceResponse> leaveBalanceResponses;
}
