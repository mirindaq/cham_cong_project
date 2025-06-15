package com.attendance.fpt.services.impl;

import com.attendance.fpt.enums.AttendanceStatus;
import com.attendance.fpt.model.response.AttendanceDailyResponse;
import com.attendance.fpt.model.response.AttendanceWeeklyResponse;
import com.attendance.fpt.model.response.LeaveOverallResponse;
import com.attendance.fpt.repositories.AttendanceRepository;
import com.attendance.fpt.repositories.LeaveRequestRepository;
import com.attendance.fpt.repositories.WorkShiftAssignmentRepository;
import com.attendance.fpt.services.StatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticService {

    private final WorkShiftAssignmentRepository workShiftAssignmentRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceRepository attendanceRepository;
    @Override
    public AttendanceWeeklyResponse getWeeklyAttendanceStatistics() {
        LocalDate startOfWeek = LocalDate.now().with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = LocalDate.now().with(DayOfWeek.SUNDAY);


        List<Object[]> statistic = workShiftAssignmentRepository.getStatisticByDateAssignBetween(startOfWeek, endOfWeek);
        Map<LocalDate, AttendanceDailyResponse> dataMap = statistic.stream()
                .collect(Collectors.toMap(
                        rs -> (LocalDate) rs[0],
                        rs -> AttendanceDailyResponse.builder()
                                .date((LocalDate) rs[0])
                                .present(rs[1] != null ? (Long) rs[1] : 0L)
                                .leave(rs[2] != null ? (Long) rs[2] : 0L)
                                .late(rs[3] != null ? (Long) rs[3] : 0L)
                                .absent(rs[4] != null ? (Long) rs[4] : 0L)
                                .total(rs[5] != null ? (Long) rs[5] : 0L)
                                .build()
                ));

        // Tạo đủ 7 ngày trong tuần từ Thứ 2 đến CN
        List<AttendanceDailyResponse> result = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = startOfWeek.plusDays(i);
            AttendanceDailyResponse response = dataMap.getOrDefault(date,
                    AttendanceDailyResponse.builder()
                            .date(date)
                            .present(0L).leave(0L).late(0L).absent(0L).total(0L)
                            .build());
            result.add(response);
        }

        return AttendanceWeeklyResponse.builder()
                .currentDate(LocalDate.now())
                .attendanceOfWeek(result)
                .build();

    }

    @Override
    public List<LeaveOverallResponse> getLeaveOverallStatistics() {
        List<Object[]> statistic = leaveRequestRepository.getLeaveOverallStatistics();
        if (statistic != null && !statistic.isEmpty()) {
            return statistic.stream()
                    .map(rs -> LeaveOverallResponse.builder()
                            .name((String) rs[0])
                            .value(rs[1] != null ? (Long) rs[1] : 0L)
                            .build())
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    @Override
    public long getTotalLeaveInDay() {
        LocalDate today = LocalDate.now();
        return attendanceRepository.countByDateAndStatus(today, AttendanceStatus.LEAVE);
    }

}
