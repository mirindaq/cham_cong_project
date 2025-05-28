package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.ComplaintAddRequest;
import com.attendance.fpt.model.request.LeaveRequestAddRequest;
import com.attendance.fpt.model.response.ComplaintResponse;
import com.attendance.fpt.model.response.LeaveRequestResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.services.ComplaintsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/complaints")
public class ComplaintsController {

    private final ComplaintsService complaintsService;

    @GetMapping
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<ComplaintResponse>>>> getAllComplaints(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all complaint success",
                complaintsService.getAllComplaints(page, size)
        ));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<ComplaintResponse>>>> getAllComplaintsByEmployee(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get complaint success",
                complaintsService.getAllComplaintsByEmployeeId(page, size, employeeId)
        ));
    }

    @PostMapping("")
    public ResponseEntity<ResponseSuccess<ComplaintResponse>> createComplaint(@Valid @RequestBody ComplaintAddRequest complaintAddRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.CREATED,
                "Create complaint success",
                complaintsService.createComplaint(complaintAddRequest)
        ));
    }

    @PutMapping("/{id}/recall")
    public ResponseEntity<ResponseSuccess<Void>> recallComplaint(@PathVariable Long id) {
        complaintsService.recallComplaint(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Recall leave request success",
                null
        ));
    }

    @GetMapping("/pending")
    public ResponseEntity<ResponseSuccess<List<ComplaintResponse>>> getPendingComplaints() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get pending complaints success",
                complaintsService.getPendingComplaints()
        ));
    }

}