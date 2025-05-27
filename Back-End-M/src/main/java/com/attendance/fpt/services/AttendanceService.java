package com.attendance.fpt.services;

import com.attendance.fpt.model.request.CheckInRequest;
import com.attendance.fpt.model.request.CheckOutRequest;
import com.attendance.fpt.model.response.AttendanceWorkShiftResponse;

import java.util.List;

public interface AttendanceService {

    List<AttendanceWorkShiftResponse> getAttendanceAndShiftAssignmentByEmployeeId(Long employeeId, Long month, Long year) ;

    AttendanceWorkShiftResponse checkIn(CheckInRequest request);
    AttendanceWorkShiftResponse checkOut(CheckOutRequest checkOutRequest    );
}
