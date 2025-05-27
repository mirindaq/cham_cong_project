package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.LeaveRequestAddRequest;
import com.attendance.fpt.model.response.LeaveRequestResponse;
import com.attendance.fpt.model.response.LocationResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.services.LeaveRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/leave-requests")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @GetMapping
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<LeaveRequestResponse>>>> getAllLeaveRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all leave requests success",
                leaveRequestService.getAllLeaveRequests(page, size)
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

    @PutMapping("/{id}/reject")
    public ResponseEntity<ResponseSuccess<Void>> rejectLeaveRequest(@PathVariable Long id) {
        leaveRequestService.rejectLeaveRequest(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Reject leave request success",
                null
        ));
    }
}