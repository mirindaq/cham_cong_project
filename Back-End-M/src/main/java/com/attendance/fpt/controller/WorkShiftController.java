package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.WorkShiftRequest;
import com.attendance.fpt.model.response.WorkShiftResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.services.WorkShiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/work-shifts")
public class WorkShiftController {

    private final WorkShiftService workShiftService;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<List<WorkShiftResponse>>> getAllWorkShifts() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all work shifts success",
                workShiftService.getAllWorkShifts()
        ));
    }

    @PostMapping("/add")
    public ResponseEntity<ResponseSuccess<WorkShiftResponse>> addWorkShift(@Valid @RequestBody WorkShiftRequest workShiftRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.CREATED,
                "Add work shift success",
                workShiftService.addWorkShift(workShiftRequest)
        ));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseSuccess<WorkShiftResponse>> deleteWorkShift(@PathVariable Long id) {

        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Delete work shift success",
                workShiftService.deleteWorkShift(id)
        ));
    }



}
