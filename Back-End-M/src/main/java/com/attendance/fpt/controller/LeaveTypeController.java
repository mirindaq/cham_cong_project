package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.LeaveTypeRequest;
import com.attendance.fpt.model.request.LeaveTypeUpdateRequest;
import com.attendance.fpt.model.response.LeaveTypeResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.services.LeaveTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/leave-types")
public class LeaveTypeController {
    private final LeaveTypeService leaveTypeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<List<LeaveTypeResponse>>> getAllLeaveTypes() {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Get all leave types success", leaveTypeService.getAllLeaveTypes()));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<List<LeaveTypeResponse>>> getAllLeaveTypesActive() {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Get all leave types active success", leaveTypeService.getAllLeaveTypesActive()));
    }

    @GetMapping("/employee")
    @PreAuthorize("hasAnyRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<List<LeaveTypeResponse>>> getLeaveTypeEnableInYear() {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Get leave types by employee ID enable success",
                leaveTypeService.getLeaveTypeEnableInYear()));
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<LeaveTypeResponse>> addLeaveType(@Valid @RequestBody LeaveTypeRequest leaveTypeRequest) {
        LeaveTypeResponse response = leaveTypeService.addLeaveType(leaveTypeRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.CREATED,
                "Add leave type success", response));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<LeaveTypeResponse>> updateLeaveType(@PathVariable("id") Long leaveTypeId,
                                                                              @Valid @RequestBody LeaveTypeUpdateRequest leaveTypeUpdateRequest) {
        LeaveTypeResponse response = leaveTypeService.updateLeaveType(leaveTypeId,leaveTypeUpdateRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.CREATED,
                "Update leave type success", response));
    }

    @PutMapping("/update/{id}/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<LeaveTypeResponse>> updateStatus(@PathVariable("id") Long leaveTypeId) {
        LeaveTypeResponse response = leaveTypeService.updateStatus(leaveTypeId);
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.CREATED,
                "Update leave type success", response));
    }
}
