package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.WorkShiftRequest;
import com.attendance.fpt.model.response.WorkShiftResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.services.WorkShiftService;
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
@RequestMapping("${api.prefix}/work-shifts")
public class WorkShiftController {

    private final WorkShiftService workShiftService;

    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<List<WorkShiftResponse>>> getAllWorkShifts() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all work shifts success",
                workShiftService.getAllWorkShifts()
        ));
    }

    @GetMapping("/employee")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<List<WorkShiftResponse>>> getWorkShiftsByEmployeeBetweenDate(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get work shifts by employee ID success",
                workShiftService.getWorkShiftsByEmployeeBetweenDate( startDate, endDate)
        ));
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<WorkShiftResponse>> addWorkShift(@Valid @RequestBody WorkShiftRequest workShiftRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.CREATED,
                "Add work shift success",
                workShiftService.addWorkShift(workShiftRequest)
        ));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<WorkShiftResponse>> deleteWorkShift(@PathVariable Long id) {

        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Delete work shift success",
                workShiftService.deleteWorkShift(id)
        ));
    }



}
