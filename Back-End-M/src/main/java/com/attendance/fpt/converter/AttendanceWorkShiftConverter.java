package com.attendance.fpt.converter;

import com.attendance.fpt.entity.Attendance;
import com.attendance.fpt.entity.WorkShift;
import com.attendance.fpt.entity.WorkShiftAssignment;
import com.attendance.fpt.model.response.AttendanceWorkShiftResponse;

import java.time.LocalDate;

public class AttendanceWorkShiftConverter {

    public static AttendanceWorkShiftResponse toResponseNoHaveAttendance(WorkShiftAssignment workShiftAssignment) {
        return AttendanceWorkShiftResponse.builder()
                .workShifts(WorkShiftAssignmentConverter.toResponse(workShiftAssignment))
                .date(workShiftAssignment.getDateAssign())
                .checkIn(null)
                .checkOut(null)
                .status(workShiftAssignment.getDateAssign().isBefore(LocalDate.now()) ? "ABSENT" : null)
                .attendanceId(null)
                .locationName(null)
                .build();
    }

    public static AttendanceWorkShiftResponse toResponseHaveAttendance(WorkShiftAssignment workShiftAssignment, Attendance attendance ) {
        return AttendanceWorkShiftResponse.builder()
                .workShifts(WorkShiftAssignmentConverter.toResponse(workShiftAssignment))
                .date(workShiftAssignment.getDateAssign())
                .checkIn(attendance.getCheckInTime())
                .checkOut(attendance.getCheckOutTime())
                .status(attendance.getStatus().name())
                .attendanceId(attendance.getId())
                .locationName(attendance.getLocation().getName())
                .build();
    }
}
