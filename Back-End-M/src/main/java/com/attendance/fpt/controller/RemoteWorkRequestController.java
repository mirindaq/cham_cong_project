package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.RemoteWorkRequestAddRequest;
import com.attendance.fpt.model.request.RemoteWorkRequestHandleRequest;
import com.attendance.fpt.model.response.*;
import com.attendance.fpt.services.RemoteWorkRequestService;
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
@RequestMapping("${api.prefix}/remote-work-requests")
public class RemoteWorkRequestController {

    private final RemoteWorkRequestService remoteWorkRequestService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<RemoteWorkRequestResponse>>>> getAllRemoteWorkRequests(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) LocalDate createdDate,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long workShiftId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all remote work requests success",
                remoteWorkRequestService.getAllRemoteWorkRequests(page, size, employeeName,
                        createdDate, date, departmentId,workShiftId, status)
        ));
    }

    @GetMapping("/employee")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<RemoteWorkRequestResponse>>>> getAllRemoteWorkRequestsByEmployee(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all remote work requests by employee success",
                remoteWorkRequestService.getAllRemoteWorkRequestsByEmployee(page, size)
        ));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<RemoteWorkRequestResponse>> createRemoteWorkRequest(
            @Valid @RequestBody RemoteWorkRequestAddRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.CREATED,
                "Create remote work request success",
                remoteWorkRequestService.createRemoteWorkRequest(request)
        ));
    }

    @PutMapping("/{id}/recall")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<Void>> recallRemoteWorkRequest(@PathVariable Long id) {
        remoteWorkRequestService.recallRemoteWorkRequest(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Recall remote work request success",
                null
        ));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<Void>> approveRemoteWorkRequest(@PathVariable Long id,
                                                                          @RequestBody RemoteWorkRequestHandleRequest handleRequest) {
        remoteWorkRequestService.approveRemoteWorkRequest(id, handleRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Approve remote work request success",
                null
        ));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<Void>> rejectRemoteWorkRequest(@PathVariable Long id,
                                                                         @RequestBody RemoteWorkRequestHandleRequest handleRequest) {
        remoteWorkRequestService.rejectRemoteWorkRequest(id, handleRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Reject remote work request success",
                null
        ));
    }
}
