package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.WorkShiftAssignmentListRequest;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.model.response.WorkShiftAssignmentResponse;
import com.attendance.fpt.services.WorkShiftAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/shift-assignments")
public class WorkShiftAssignmentController {

    private final WorkShiftAssignmentService workShiftAssignmentService;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<List<WorkShiftAssignmentResponse>>> getAllAssignments() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all shift assignments success",
                workShiftAssignmentService.getAllAssignments()
        ));
    }

    @PostMapping("/add")
    public ResponseEntity<ResponseSuccess<List<WorkShiftAssignmentResponse>>> addAssignment(
            @Valid @RequestBody WorkShiftAssignmentListRequest requests) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.CREATED,
                "Add shift assignment success",
                workShiftAssignmentService.addListAssignments(requests)
        ));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ResponseSuccess<String>> deleteAssignment(
            @RequestParam Long employeeId,
            @RequestParam Long workShiftAssignmentId) {
        workShiftAssignmentService.deleteAssignment(employeeId, workShiftAssignmentId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Delete shift assignment success",
                "Shift assignment deleted successfully"
        ));
    }
}