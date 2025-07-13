package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.EmployeeAddRequest;
import com.attendance.fpt.model.request.EmployeeProfileRequest;
import com.attendance.fpt.model.request.UploadRequest;
import com.attendance.fpt.model.response.EmployeeResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.services.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.print.attribute.standard.Media;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
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

    @GetMapping("/employee-to-assignment")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<List<EmployeeResponse>>> getEmployeeToAssignment() {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Get employee to assignment success", employeeService.getEmployeeToAssignment()));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<EmployeeResponse>> getProfile() {
            return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                    "Get employee by id success", employeeService.getProfile()));
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<EmployeeResponse>> addEmployee(@Valid @RequestBody EmployeeAddRequest employeeAddRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.CREATED,
                "Add employee success", employeeService.addEmployee(employeeAddRequest)
        ));
    }

    @PutMapping("/update/{employeeId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<EmployeeResponse>> updateEmployee(
            @PathVariable Long employeeId,
            @Valid @RequestBody EmployeeAddRequest employeeAddRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Update employee success", employeeService.updateEmployee(employeeId, employeeAddRequest)
        ));
    }

    @PutMapping("/update-profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResponseSuccess<EmployeeResponse>> updateProfile(
            @Valid @RequestBody EmployeeProfileRequest employeeProfileRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Update employee success", employeeService.updateProfile(employeeProfileRequest)
        ));
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<Long>> getTotalEmployees() {
        long count = employeeService.countEmployees();
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK, "Get employee count success", count));
    }

    @PutMapping(value = "/update-avatar",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResponseSuccess<EmployeeResponse>> updateAvatar(@ModelAttribute UploadRequest uploadRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Update avatar success", employeeService.updateAvatar(uploadRequest)));
    }

}
