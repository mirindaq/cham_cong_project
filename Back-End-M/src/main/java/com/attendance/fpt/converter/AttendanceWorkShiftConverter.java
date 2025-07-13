package com.attendance.fpt.converter;

import com.attendance.fpt.entity.Attendance;
import com.attendance.fpt.entity.WorkShift;
import com.attendance.fpt.entity.WorkShiftAssignment;
import com.attendance.fpt.model.response.AttendanceWorkShiftResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AttendanceWorkShiftConverter {

    public static AttendanceWorkShiftResponse toResponseNoHaveAttendance(WorkShiftAssignment workShiftAssignment) {
        LocalDateTime now = LocalDateTime.now();
        LocalDate assignDate = workShiftAssignment.getDateAssign();
        LocalTime endTime = workShiftAssignment.getWorkShift().getEndTime();

        String status;
        if (assignDate.isBefore(now.toLocalDate())) {
            status = "ABSENT";
        } else if (assignDate.isEqual(now.toLocalDate())) {
            if (endTime.isBefore(now.toLocalTime())) {
                status = "ABSENT";
            } else {
                status = null;
            }
        } else {
            status = null;
        }


        return AttendanceWorkShiftResponse.builder()
                .workShifts(WorkShiftAssignmentConverter.toResponse(workShiftAssignment))
                .date(workShiftAssignment.getDateAssign())
                .checkIn(null)
                .checkOut(null)
                .status(status)
                .attendanceId(null)
                .locationName(null)
                .image(null)
                .editedBy( null)
                .editedTime(null)
                .edited(false)
                .locked(false)
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
                .locationName( attendance.getLocation() != null ? attendance.getLocation().getName() : null)
                .image(attendance.getImage() != null ? attendance.getImage() : null)
                .editedBy(attendance.getEditedBy() != null ? attendance.getEditedBy() : null)
                .editedTime(attendance.getEditedTime() != null ? attendance.getEditedTime() : null)
                .edited(attendance.isEdited())
                .locked(workShiftAssignment.isLocked())
                .build();
    }
}
