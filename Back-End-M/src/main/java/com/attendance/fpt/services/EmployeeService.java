package com.attendance.fpt.services;

import com.attendance.fpt.model.request.EmployeeAddRequest;
import com.attendance.fpt.model.request.EmployeeProfileRequest;
import com.attendance.fpt.model.response.EmployeeResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;

import java.util.List;

public interface EmployeeService {

    EmployeeResponse addEmployee(EmployeeAddRequest employeeAddRequest);

    EmployeeResponse updateEmployee(Long employeeId, EmployeeAddRequest employeeAddRequest);

    EmployeeResponse updateProfile(Long employeeId, EmployeeProfileRequest employeeProfileRequest);

    List<EmployeeResponse> getEmployeeToAssignment();

    ResponseWithPagination<List<EmployeeResponse>> getAllEmployees(
        int page, 
        int limit, 
        String name, 
        String email, 
        String phone, 
        String role, 
        String status, 
        String departmentName
    );

    EmployeeResponse getEmployeeById(Long employeeId);

    long countEmployees();
} 