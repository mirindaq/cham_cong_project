package com.attendance.fpt.services;

import com.attendance.fpt.model.request.AttendanceUpdateRequest;
import com.attendance.fpt.model.request.CheckInRequest;
import com.attendance.fpt.model.request.CheckOutRequest;
import com.attendance.fpt.model.response.AttendanceWorkShiftResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {

    List<AttendanceWorkShiftResponse> getAttendanceAndShiftAssignmentByEmployee( Long month, Long year) ;

    AttendanceWorkShiftResponse checkIn(CheckInRequest request);
    AttendanceWorkShiftResponse checkOut(CheckOutRequest checkOutRequest );
    ResponseWithPagination<List<AttendanceWorkShiftResponse>> getAllAttendances(String employeeName, LocalDate date, String status , int page, int limit);
    List<AttendanceWorkShiftResponse> getRecentCheckers();


    AttendanceWorkShiftResponse updateAttendance(Long workShiftAssignmentId, AttendanceUpdateRequest attendanceUpdateRequest);

    AttendanceWorkShiftResponse getAttendanceById(Long attendanceId);
}
