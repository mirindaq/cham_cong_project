package com.attendance.fpt.model.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LeaveBalancePerEmployeeResponse {
    private Long id;
    private Integer usedDay;
    private Integer year;
    private Integer remainingDay;
    private String employeeName;
    private String departmentName;
    private String employeeEmail;
    private LeaveTypeResponse leaveType;
}
