package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.PartTimeRequestAddRequest;
import com.attendance.fpt.model.request.PartTimeRequestHandleRequest;
import com.attendance.fpt.model.response.*;
import com.attendance.fpt.services.PartTimeRequestService;
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
@RequestMapping("${api.prefix}/part-time-requests")
public class PartTimeRequestController {

    private final PartTimeRequestService partTimeRequestService;

    @GetMapping()
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<PartTimeRequestResponse>>>> getAllPartTimeRequests(
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
                "Get all part time requests success",
                partTimeRequestService.getAllPartTimeRequests(page, size, employeeName,
                        createdDate, date, departmentId, workShiftId, status)
        ));
    }

    @GetMapping("/employee")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<PartTimeRequestResponse>>>> getAllPartTimeRequestsByEmployee(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all part time requests success",
                partTimeRequestService.getAllPartTimeRequestsByEmployee(page, size)
        ));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<PartTimeRequestResponse>> createPartTimeRequest(@Valid @RequestBody PartTimeRequestAddRequest partTimeRequestAddRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.CREATED,
                "Create part time request success",
                partTimeRequestService.createPartTimeRequest(partTimeRequestAddRequest)
        ));
    }

    @PutMapping("/{id}/recall")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<Void>> recallPartTimeRequest(@PathVariable Long id) {
        partTimeRequestService.recallPartTimeRequest(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Recall part time request success",
                null
        ));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<Void>> approvePartTimeRequest(@PathVariable Long id,
                                                                     @RequestBody PartTimeRequestHandleRequest partTimeRequestHandleRequest) {
        partTimeRequestService.approvePartTimeRequest(id, partTimeRequestHandleRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Approve part time request success",
                null
        ));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<Void>> rejectPartTimeRequest(@PathVariable Long id,
                                                                    @RequestBody PartTimeRequestHandleRequest partTimeRequestHandleRequest) {
        partTimeRequestService.rejectPartTimeRequest(id, partTimeRequestHandleRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Reject part time request success",
                null
        ));
    }
}
