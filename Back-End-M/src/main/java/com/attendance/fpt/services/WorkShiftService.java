package com.attendance.fpt.services;

import com.attendance.fpt.model.request.WorkShiftRequest;
import com.attendance.fpt.model.response.WorkShiftResponse;

import java.time.LocalDate;
import java.util.List;

public interface WorkShiftService {
    List<WorkShiftResponse> getAllWorkShifts();
    WorkShiftResponse addWorkShift(WorkShiftRequest workShiftRequest);
    WorkShiftResponse deleteWorkShift(Long id);

    List<WorkShiftResponse> getWorkShiftsByEmployeeIdBetweenDate(Long employeeId, LocalDate startDate, LocalDate endDate);
}