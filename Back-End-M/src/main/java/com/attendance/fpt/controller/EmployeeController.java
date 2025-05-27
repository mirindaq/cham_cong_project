package com.attendance.fpt.controller;


import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.model.request.EmployeeAddRequest;
import com.attendance.fpt.model.response.EmployeeResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.services.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<EmployeeResponse>>>> getAllEmployee(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "departmentName", required = false) String departmentName) {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Get employee success", employeeService.getAllEmployees(page, limit, name, email, phone, role, status, departmentName)));
    }

    @GetMapping("/profile/{employeeId}")
    public ResponseEntity<ResponseSuccess<EmployeeResponse>> getEmployeeById(@PathVariable Long employeeId) {
            return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                    "Get employee by id success", employeeService.getEmployeeById(employeeId)));
    }

    @PostMapping("/add")
    public ResponseEntity<ResponseSuccess<EmployeeResponse>> addEmployee(@Valid @RequestBody EmployeeAddRequest employeeAddRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.CREATED,
                "Add employee success", employeeService.addEmployee(employeeAddRequest)
        ));
    }

    @PutMapping("/update/{employeeId}")
    public ResponseEntity<ResponseSuccess<EmployeeResponse>> updateEmployee(
            @PathVariable Long employeeId,
            @Valid @RequestBody EmployeeAddRequest employeeAddRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Update employee success", employeeService.updateEmployee(employeeId, employeeAddRequest)
        ));
    }

}
