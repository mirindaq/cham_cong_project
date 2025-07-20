package com.attendance.fpt.services;

import com.attendance.fpt.model.response.*;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

public interface StatisticService {
    AttendanceWeeklyResponse getWeeklyAttendanceStatistics();

    List<LeaveOverallResponse> getLeaveOverallStatistics();

    long getTotalLeaveInDay();


    List<TopStaffAttendanceResponse> getTopFiveStaffAttendanceByMonth(int month,int year);

    List<OverallStatisticMonthResponse> getOverallByMonth(int month, int year);

    List<LeaveOverallResponse> getLeaveOverallStatisticsByMonth(int month, int year);

    void exportStatisticToExcel(int month, int year, HttpServletResponse response);

    List<OverallStatisticEmployeeYearResponse> getOverallAttendanceEmployeeByYear(int year);

    StatisticOverallEmployeeResponse getOverallEmployee( int month, int year);

    List<LeaveOverallResponse> getLeaveOverallEmployeeStatistics( int year);
}
