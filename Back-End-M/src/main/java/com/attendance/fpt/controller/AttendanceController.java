package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.CheckInRequest;
import com.attendance.fpt.model.request.CheckOutRequest;
import com.attendance.fpt.model.response.AttendanceWorkShiftResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.services.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/attendances")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<AttendanceWorkShiftResponse>>>> getAllAttendance(
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int limit

    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all attendance success",
                attendanceService.getAllAttendances( employeeName, date, status, page, limit)
        ));
    }

    @GetMapping("/recent-checker")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<List<AttendanceWorkShiftResponse>>> getRecentCheckers() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get recent checkers success",
                attendanceService.getRecentCheckers()
        ));
    }

    @GetMapping("/employee")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<List<AttendanceWorkShiftResponse>>> getAssignmentsByEmployeeAndDateId(
            @RequestParam(required = false) Long month,
            @RequestParam(required = false) Long year) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get shift assignments by employee ID success",
                attendanceService.getAttendanceAndShiftAssignmentByEmployee( month, year)
        ));
    }

    @PostMapping("/check-in")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<AttendanceWorkShiftResponse>> checkIn(
            @RequestBody CheckInRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Check-in successful",
                attendanceService.checkIn(request)
        ));
    }

    @PostMapping("/check-out")
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<AttendanceWorkShiftResponse>> checkOut(
            @RequestBody CheckOutRequest checkOutRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Check-out successful",
                attendanceService.checkOut(checkOutRequest)
        ));
    }
}
