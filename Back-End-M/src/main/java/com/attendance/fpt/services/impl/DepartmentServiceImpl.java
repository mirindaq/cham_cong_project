package com.attendance.fpt.services.impl;

import com.attendance.fpt.entity.Department;
import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.DepartmentRequest;
import com.attendance.fpt.model.response.DepartmentResponse;
import com.attendance.fpt.repositories.DepartmentRepository;
import com.attendance.fpt.services.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

     private final DepartmentRepository departmentRepository;

    @Override
    @Transactional
    public DepartmentResponse addDepartment(DepartmentRequest departmentRequest) {
        if ( departmentRepository.existsByName(departmentRequest.getName())) {
            throw new ConflictException("Department with this name already exists");
        }

        Department department = new Department();
        department.setName(departmentRequest.getName());
        department = departmentRepository.save(department);
        return new DepartmentResponse(department.getId(), department.getName());
    }

    @Override
    public List<DepartmentResponse> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        return departments.stream()
                .map(department -> new DepartmentResponse(department.getId(), department.getName()))
                .toList();
    }

    @Override
    @Transactional
    public DepartmentResponse updateDepartment(Long departmentId, DepartmentRequest departmentRequest) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        if (departmentRepository.existsByName(departmentRequest.getName())) {
            throw new ConflictException("Department with this name already exists");
        }

        department.setName(departmentRequest.getName());

        departmentRepository.save(department);
        return new DepartmentResponse(department.getId(), department.getName());
    }

    @Override
    public void deleteDepartment(Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        if (!department.getEmployees().isEmpty()) {
            throw new ConflictException("Cannot delete department with employees");
        }

        departmentRepository.delete(department);
    }
}