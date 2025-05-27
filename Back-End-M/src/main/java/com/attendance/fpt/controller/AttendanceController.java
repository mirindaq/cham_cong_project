package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.CheckInRequest;
import com.attendance.fpt.model.request.CheckOutRequest;
import com.attendance.fpt.model.response.AttendanceWorkShiftResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.services.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/attendances")
public class AttendanceController {

    private final AttendanceService attendanceService;


    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ResponseSuccess<List<AttendanceWorkShiftResponse>>> getAssignmentsByEmployeeAndDateId(
            @PathVariable Long employeeId,
            @RequestParam(required = false) Long month,
            @RequestParam(required = false) Long year) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get shift assignments by employee ID success",
                attendanceService.getAttendanceAndShiftAssignmentByEmployeeId(employeeId, month, year)
        ));
    }

    @PostMapping("/check-in")
    public ResponseEntity<ResponseSuccess<AttendanceWorkShiftResponse>> checkIn(
            @RequestBody CheckInRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Check-in successful",
                attendanceService.checkIn(request)
        ));
    }

    @PostMapping("/check-out")
    public ResponseEntity<ResponseSuccess<AttendanceWorkShiftResponse>> checkOut(
            @RequestBody CheckOutRequest checkOutRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Check-out successful",
                attendanceService.checkOut(checkOutRequest)
        ));
    }
}
