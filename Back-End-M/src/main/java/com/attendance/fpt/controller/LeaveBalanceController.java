package com.attendance.fpt.controller;
import com.attendance.fpt.model.response.*;
import com.attendance.fpt.services.LeaveBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/leave-balances")
public class LeaveBalanceController {
    
    private final LeaveBalanceService leaveBalanceService;

    @GetMapping("/employee")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<ResponseSuccess<List<LeaveBalanceResponse>>> getLeaveBalanceByEmployee() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get leave balance by employee id success",
                leaveBalanceService.getLeaveBalanceByEmployee()
        ));
    }

    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<LeaveBalancePerEmployeeResponse>>>> getAllLeaveBalance(
            @RequestParam(required = false) String  employeeName,
            @RequestParam(required = false) Long year,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String leaveBalanceType,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int limit

    ) {
        if ( year == null ){
            year = (long) LocalDate.now().getYear();
        }
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all leave balance success",
                leaveBalanceService.getAllLeaveBalance(employeeName, year,departmentId, leaveBalanceType, page, limit)
        ));
    }
}
