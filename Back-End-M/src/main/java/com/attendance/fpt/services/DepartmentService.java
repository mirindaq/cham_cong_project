package com.attendance.fpt.services;

import com.attendance.fpt.model.request.DepartmentRequest;
import com.attendance.fpt.model.response.DepartmentResponse;

import java.util.List;

public interface DepartmentService {

    DepartmentResponse addDepartment(DepartmentRequest departmentRequest);

    List<DepartmentResponse> getAllDepartments();

    DepartmentResponse updateDepartment(Long departmentId, DepartmentRequest departmentRequest);

    void deleteDepartment(Long departmentId);
}