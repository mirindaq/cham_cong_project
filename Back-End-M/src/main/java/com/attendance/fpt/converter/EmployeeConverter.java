package com.attendance.fpt.converter;

import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.model.response.EmployeeResponse;

public class EmployeeConverter {

    public static EmployeeResponse toResponse(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .address(employee.getAddress())
                .departmentName(employee.getDepartment().getName())
                .position(employee.getPosition())
                .dob(employee.getDob())
                .joinDate(employee.getJoinDate())
                .employeeType(employee.getEmployeeType().name())
                .active(employee.isActive())
                .role(employee.getAccount() != null ? employee.getAccount().getRole().name() : null)
                .leaveBalanceResponses(employee.getLeaveBalance().stream()
                        .map(LeaveBalanceConverter::toResponse)
                        .toList())
                .avatar(employee.getAvatar())
                .build();
    }

}
