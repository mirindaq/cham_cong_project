package com.attendance.fpt.controller;
import com.attendance.fpt.model.request.DepartmentRequest;
import com.attendance.fpt.model.request.EmployeeAddRequest;
import com.attendance.fpt.model.response.DepartmentResponse;
import com.attendance.fpt.model.response.EmployeeResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.services.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/departments")
public class DepartmentController {
    private final DepartmentService departmentService;

    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<List<DepartmentResponse>>> getAllDepartments() {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Get all departments success", departmentService.getAllDepartments()));
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<DepartmentResponse>> addDepartment(@Valid @RequestBody DepartmentRequest departmentRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.CREATED,
                "Add department success",  departmentService.addDepartment(departmentRequest)));
    }

    @PutMapping("/update/{departmentId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<DepartmentResponse>> updateDepartment(
            @PathVariable Long departmentId,
            @Valid @RequestBody DepartmentRequest departmentRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Update department success",  departmentService.updateDepartment( departmentId, departmentRequest)));
    }

    @DeleteMapping("/delete/{departmentId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<String>> deleteDepartment(@PathVariable Long departmentId) {
        departmentService.deleteDepartment(departmentId);
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Delete department success", null));
    }


}