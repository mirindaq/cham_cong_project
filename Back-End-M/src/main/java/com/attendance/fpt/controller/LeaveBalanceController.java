package com.attendance.fpt.controller;
import com.attendance.fpt.model.response.LeaveBalanceResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.services.LeaveBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/leave-balances")
public class LeaveBalanceController {
    
    private final LeaveBalanceService leaveBalanceService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ResponseSuccess<List<LeaveBalanceResponse>>> getLeaveBalanceByEmployeeId(@PathVariable Long employeeId) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get leave balance by employee id success",
                leaveBalanceService.getLeaveBalanceByEmployeeId(employeeId)
        ));
    }
}
