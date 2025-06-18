package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.RevertLeaveRequestAddRequest;
import com.attendance.fpt.model.request.RevertLeaveRequestHandleRequest;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.model.response.RevertLeaveRequestResponse;
import com.attendance.fpt.services.RevertLeaveRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/revert-leave-requests")
public class RevertLeaveRequestController {

    private final RevertLeaveRequestService revertLeaveRequestService;
    @GetMapping()
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<RevertLeaveRequestResponse>>>> getAllRevertLeaveRequests(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam( required = false) String employeeName,
            @RequestParam(required = false) LocalDate createdDate,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) Long departmentId,
            @RequestParam( required = false) Long workShiftId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all revert leave requests success",
                revertLeaveRequestService.getAllRevertLeaveRequests(page, size, employeeName,
                        createdDate,date, departmentId, workShiftId, status)
        ));
    }

    @GetMapping("/employee")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<RevertLeaveRequestResponse>>>> getAllRevertLeaveRequestsByEmployee(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
           ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all revert leave requests success",
                revertLeaveRequestService.getAllRevertLeaveRequestsByEmployee(page, size)
        ));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<RevertLeaveRequestResponse>> createRevertLeaveRequest(@Valid @RequestBody RevertLeaveRequestAddRequest revertLeaveRequestAddRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.CREATED,
                "Create revert leave request success",
                revertLeaveRequestService.createRevertLeaveRequest(revertLeaveRequestAddRequest)
        ));
    }

    @PutMapping("/{id}/recall")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<Void>> recallRevertLeaveRequest(@PathVariable Long id) {
        revertLeaveRequestService.recallRevertLeaveRequest(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Recall revert leave request success",
                null
        ));
    }


    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<Void>> approveRevertLeaveRequest(@PathVariable Long id,
                                                                     @RequestBody RevertLeaveRequestHandleRequest revertLeaveRequestHandleRequest) {
        revertLeaveRequestService.approveRevertLeaveRequest(id, revertLeaveRequestHandleRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Approve revert leave request success",
                null
        ));
    }


    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<Void>> rejectRevertLeaveRequest(@PathVariable Long id,
                                                                    @RequestBody RevertLeaveRequestHandleRequest revertLeaveRequestHandleRequest) {
        revertLeaveRequestService.rejectRevertLeaveRequest(id, revertLeaveRequestHandleRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Reject revert leave request success",
                null
        ));
    }

}
