package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.LeaveRequestAddRequest;
import com.attendance.fpt.model.request.LeaveRequestHandleRequest;
import com.attendance.fpt.model.response.*;
import com.attendance.fpt.services.LeaveRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/leave-requests")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @GetMapping()
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<LeaveRequestResponse>>>> getAllLeaveRequests(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam( required = false) String employeeName,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) Long departmentId,
            @RequestParam( required = false) Long workShiftId,
            @RequestParam( required = false) Long leaveTypeId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all leave requests success",
                leaveRequestService.getAllLeaveRequests(page, size, employeeName,
                        startDate, endDate, departmentId, workShiftId, leaveTypeId, status)
        ));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<LeaveRequestResponse>>>> getAllLeaveRequestsByEmployee(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all leave requests success",
                leaveRequestService.getAllLeaveRequestsByEmployee(page, size, employeeId)
        ));
    }

    @PostMapping("")
    public ResponseEntity<ResponseSuccess<LeaveRequestResponse>> createLeaveRequest(@Valid @RequestBody LeaveRequestAddRequest leaveRequestAddRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.CREATED,
                "Create leave request success",
                leaveRequestService.createLeaveRequest(leaveRequestAddRequest)
        ));
    }

    @PutMapping("/{id}/recall")
    public ResponseEntity<ResponseSuccess<Void>> recallLeaveRequest(@PathVariable Long id) {
        leaveRequestService.recallLeaveRequest(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Recall leave request success",
                null
        ));
    }


    @GetMapping("/pending")
    public ResponseEntity<ResponseSuccess<List<LeaveRequestResponse>>> getPendingLeaveRequests() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get pending leave requests success",
                leaveRequestService.getPendingLeaveRequests()
        ));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ResponseSuccess<Void>> approveLeaveRequest(@PathVariable Long id,
                                                                     @RequestBody LeaveRequestHandleRequest leaveRequestHandleRequest) {
        leaveRequestService.approveLeaveRequest(id, leaveRequestHandleRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Approve leave request success",
                null
        ));
    }


    @PutMapping("/{id}/reject")
    public ResponseEntity<ResponseSuccess<Void>> rejectLeaveRequest(@PathVariable Long id,
                                                                    @RequestBody LeaveRequestHandleRequest leaveRequestHandleRequest) {
        leaveRequestService.rejectLeaveRequest(id, leaveRequestHandleRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Reject leave request success",
                null
        ));
    }
}