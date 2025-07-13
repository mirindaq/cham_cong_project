package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.RevertLeaveRequestAddRequest;
import com.attendance.fpt.model.request.RevertLeaveRequestHandleRequest;
import com.attendance.fpt.model.request.ShiftChangeAddRequest;
import com.attendance.fpt.model.request.ShiftChangeRequestHandleRequest;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.model.response.RevertLeaveRequestResponse;
import com.attendance.fpt.model.response.ShiftChangeRequestResponse;
import com.attendance.fpt.services.RevertLeaveRequestService;
import com.attendance.fpt.services.ShiftChangeRequestService;
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
@RequestMapping("${api.prefix}/shift-change-requests")
public class ShiftChangeRequestController {

    private final ShiftChangeRequestService shiftChangeRequestService;

    @GetMapping()
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<ShiftChangeRequestResponse>>>> getShiftChangeRequestAdmin(
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
                shiftChangeRequestService.getShiftChangeRequestAdmin(page, size, employeeName,
                        createdDate,date, departmentId, workShiftId, status)
        ));
    }

    //done
    @GetMapping("/employee/sent")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<ShiftChangeRequestResponse>>>> getSentShiftChangeRequests(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all sent shift change requests success",
                shiftChangeRequestService.getAllSentShiftChangeRequests(page, size)
        ));
    }

    //done
    @GetMapping("/employee/received")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<ShiftChangeRequestResponse>>>> getReceivedShiftChangeRequests(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all received shift change requests success",
                shiftChangeRequestService.getAllReceivedShiftChangeRequests(page, size)
        ));
    }



    //done
    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<ShiftChangeRequestResponse>> createShiftChangeRequest(@Valid @RequestBody ShiftChangeAddRequest shiftChangeAddRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.CREATED,
                "Create shift change request success",
                shiftChangeRequestService.createShiftChangeRequest(shiftChangeAddRequest)
        ));
    }

    //done
    @PutMapping("/{id}/recall")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<Void>> recallShiftChangeRequest(@PathVariable Long id) {
        shiftChangeRequestService.recallShiftChangeRequest(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Recall revert leave request success",
                null
        ));
    }


    @PutMapping("/employee/{id}/approve")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<Void>> employeeApproveShiftChangeRequest(@PathVariable Long id) {
        shiftChangeRequestService.employeeApproveShiftChangeRequest(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Employee B approve shift change request success",
                null
        ));
    }

    @PutMapping("/employee/{id}/reject")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<Void>> employeeRejectShiftChangeRequest(@PathVariable Long id) {
        shiftChangeRequestService.employeeRejectShiftChangeRequest(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Employee B reject shift change request success",
                null
        ));
    }

    @PutMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<Void>> adminApproveShiftChangeRequest(@PathVariable Long id,
                                                                                @RequestBody ShiftChangeRequestHandleRequest handleRequest) {
        shiftChangeRequestService.adminApproveShiftChangeRequest(id, handleRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Admin approve shift change request success",
                null
        ));
    }

    @PutMapping("/admin/{id}/reject")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<Void>> adminRejectShiftChangeRequest(@PathVariable Long id,
                                                                               @RequestBody ShiftChangeRequestHandleRequest handleRequest) {
        shiftChangeRequestService.adminRejectShiftChangeRequest(id, handleRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Admin reject shift change request success",
                null
        ));
    }


}
