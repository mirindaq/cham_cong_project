package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.LeaveTypeRequest;
import com.attendance.fpt.model.response.LeaveTypeResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.services.LeaveTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/leave-types")
public class LeaveTypeController {
    private final LeaveTypeService leaveTypeService;

    @GetMapping
    public ResponseEntity<ResponseSuccess<List<LeaveTypeResponse>>> getAllLeaveTypes() {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Get all leave types success", leaveTypeService.getAllLeaveTypes()));
    }

    @PostMapping("/add")
    public ResponseEntity<ResponseSuccess<LeaveTypeResponse>> addLeaveType(@Valid @RequestBody LeaveTypeRequest leaveTypeRequest) {
        LeaveTypeResponse response = leaveTypeService.addLeaveType(leaveTypeRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.CREATED,
                "Add leave type success", response));
    }
}
