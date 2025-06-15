package com.attendance.fpt.services;

import com.attendance.fpt.model.response.AttendanceDailyResponse;
import com.attendance.fpt.model.response.AttendanceWeeklyResponse;
import com.attendance.fpt.model.response.LeaveOverallResponse;

import java.util.List;

public interface StatisticService {
    AttendanceWeeklyResponse getWeeklyAttendanceStatistics();

    List<LeaveOverallResponse> getLeaveOverallStatistics();

    long getTotalLeaveInDay();
}
