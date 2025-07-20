package com.attendance.fpt.services.impl;

import com.attendance.fpt.entity.Attendance;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.entity.WorkShiftAssignment;
import com.attendance.fpt.enums.AttendanceStatus;
import com.attendance.fpt.model.response.*;
import com.attendance.fpt.repositories.AttendanceRepository;
import com.attendance.fpt.repositories.LeaveRequestRepository;
import com.attendance.fpt.repositories.WorkShiftAssignmentRepository;
import com.attendance.fpt.services.StatisticService;
import com.attendance.fpt.utils.BaseExport;
import com.attendance.fpt.utils.SecurityUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticService {

    private final AttendanceRepository attendanceRepository;
    private final WorkShiftAssignmentRepository workShiftAssignmentRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final SecurityUtil securityUtil;

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

    @Override
    public List<TopStaffAttendanceResponse> getTopFiveStaffAttendanceByMonth(int month, int year) {
        List<Object[]> statistic = workShiftAssignmentRepository.getTopFiveStaffAttendance(month,year);

        if (statistic != null && !statistic.isEmpty()) {
            return statistic.stream()
                    .map(rs -> TopStaffAttendanceResponse.builder()
                            .employeeId((Long) rs[0])  // Mã nhân viên
                            .employeeName((String) rs[1])  // Tên nhân viên
                            .departmentName((String) rs[2])  // Tên phòng ban
                            .totalWorkShiftAssignment((Long) rs[3])  // Tổng số ca phân công
                            .totalAttendanceWorkShift((Long) rs[4])  // Tổng số ca đi làm
                            .totalLateWorkShift((Long) rs[5])  // Tổng số ca đi muộn
                            .totalAbsentWorkShift((Long) rs[6])  // Tổng số ca vắng
                            .totalLeaveWorkShift((Long) rs[7])  // Tổng số ca nghỉ phép
                            .totalWorkingHours((Double) rs[8])  // Tổng số giờ làm
                            .build())
                    .collect(Collectors.toList());
        }

        return Collections.emptyList();
    }

    private int getWeekOfMonth(LocalDate date) {
        LocalDate firstDayOfMonth = date.withDayOfMonth(1);
        int dayOfWeekOffset = firstDayOfMonth.getDayOfWeek().getValue() - 1; // Tính từ thứ 2 = 0
        return (date.getDayOfMonth() + dayOfWeekOffset - 1) / 7 + 1;
    }



    @Override
    public List<OverallStatisticMonthResponse> getOverallByMonth(int month, int year) {
        List<Object[]> rawData = workShiftAssignmentRepository.getStatisticByWeekInMonth(month, year);
        Map<Integer, OverallStatisticMonthResponse> weekMap = new TreeMap<>();

        for (Object[] row : rawData) {
            LocalDate dateAssign = (LocalDate) row[0];

            int weekOfMonth = getWeekOfMonth(dateAssign);

            OverallStatisticMonthResponse res = weekMap.getOrDefault(weekOfMonth, new OverallStatisticMonthResponse());
            res.setName("Tuần " + weekOfMonth);
            res.setPresent(res.getPresent() + ((Number) row[1]).intValue());
            res.setAbsent(res.getAbsent() + ((Number) row[2]).intValue());
            res.setLate(res.getLate() + ((Number) row[3]).intValue());
            res.setLeave(res.getLeave() + ((Number) row[4]).intValue());
            res.setTotal(res.getTotal() + ((Number) row[5]).intValue());

            weekMap.put(weekOfMonth, res);
        }

        return new ArrayList<>(weekMap.values());

    }

    @Override
    public List<LeaveOverallResponse> getLeaveOverallStatisticsByMonth(int month, int year) {
        List<Object[]> statistic = leaveRequestRepository.getLeaveOverallStatisticsByMonth(month,year);
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
    public void exportStatisticToExcel(int month, int year, HttpServletResponse response) {
        List<WorkShiftAssignment> statisticAttendance = workShiftAssignmentRepository.getAllWorkShiftAttendanceByMonthAndYear(month,year);
        List<WorkShiftAssignment> statisticLeave = workShiftAssignmentRepository.getAllWorkShiftAttendanceAbsentByMonthAndYear(month,year);

        List<WorkShiftAssignment> leaveList = new ArrayList<>();
        List<WorkShiftAssignment> attendanceList = new ArrayList<>();

        for (WorkShiftAssignment ws : statisticAttendance) {
            if ( ws.getAttendance().getLeaveRequest() != null) {
                leaveList.add(ws);
            } else {
                attendanceList.add(ws);
            }
        }

        BaseExport export = new BaseExport();

        export
                .addSheet("Danh sách chấm công", attendanceList, WorkShiftAssignment.class,
                        new String[]{ "employee.fullName", "employee.phone",
                                "employee.department.name","workShift.name", "dateAssign", "workShift.startTime",
                                "workShift.endTime", "workShift.isPartTime", "attendance.checkInTime", "attendance.checkOutTime", "attendance.totalHours"})
                .writeHeaderLine(new String[]{"STT", "Tên nhân viên", "Số điện thoại",
                        "Phòng ban", "Tên ca làm","Ngày phân công", "Thời gian bắt đầu", "Thời gian kết thúc",
                        "Ca làm bán thời gian",  "Thời gian vào", "Thời gian ra", "Tổng giờ làm"}, "Danh sách chấm công")
                .writeDataLines("Danh sách chấm công");
        export
                .addSheet("Danh sách vắng mặt", leaveList, WorkShiftAssignment.class,
                        new String[]{ "employee.fullName", "employee.phone",
                                "employee.department.name","workShift.name", "dateAssign", "workShift.startTime",
                                "workShift.endTime", "workShift.isPartTime", "attendance.leaveRequest.reason",
                                "attendance.leaveRequest.responseBy.fullName","attendance.leaveRequest.responseNote"})
                .writeHeaderLine(new String[]{"STT", "Tên nhân viên", "Số điện thoại",
                        "Phòng ban", "Tên ca làm","Ngày phân công", "Thời gian bắt đầu", "Thời gian kết thúc",
                        "Ca làm bán thời gian","Lý do nghỉ", "Người duyệt","Lý do duyệt"}, "Danh sách vắng mặt")
                .writeDataLines("Danh sách vắng mặt");

        export
                .addSheet("Danh sách vắng mặt không phép", statisticLeave, WorkShiftAssignment.class,
                        new String[]{ "employee.fullName", "employee.phone",
                                "employee.department.name","workShift.name", "dateAssign", "workShift.startTime",
                                "workShift.endTime", "workShift.isPartTime"})
                .writeHeaderLine(new String[]{"STT", "Tên nhân viên", "Số điện thoại",
                        "Phòng ban", "Tên ca làm","Ngày phân công", "Thời gian bắt đầu", "Thời gian kết thúc",
                        "Ca làm bán thời gian"}, "Danh sách vắng mặt không phép")
                .writeDataLines("Danh sách vắng mặt không phép");

        try {
            export.export(response);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<OverallStatisticEmployeeYearResponse> getOverallAttendanceEmployeeByYear(int year) {
        Employee employee = securityUtil.getCurrentUser();
        List<WorkShiftAssignment> assignments = workShiftAssignmentRepository.getAssignmentsByYear(employee.getId(), year);

        Map<Integer, OverallStatisticEmployeeYearResponse> statsMap = new HashMap<>();

        for (WorkShiftAssignment wsa : assignments) {
            int month = wsa.getDateAssign().getMonthValue();
            LocalDate date = wsa.getDateAssign();
            LocalTime endTime = wsa.getWorkShift().getEndTime();
            LocalDateTime endDateTime = LocalDateTime.of(date, endTime);

            Attendance attendance = wsa.getAttendance();

            OverallStatisticEmployeeYearResponse stat = statsMap.getOrDefault(month,
                    OverallStatisticEmployeeYearResponse.builder()
                            .month("T" + month)
                            .present(0)
                            .absent(0)
                            .late(0)
                            .leave(0)
                            .total(0)
                            .build()
            );

            if (attendance != null) {
                switch (attendance.getStatus()) {
                    case PRESENT -> stat.setPresent(stat.getPresent() + 1);
                    case LATE -> stat.setLate(stat.getLate() + 1);
                    case LEAVE -> stat.setLeave(stat.getLeave() + 1);
                }
            } else {
                if (LocalDateTime.now().isAfter(endDateTime)) {
                    stat.setAbsent(stat.getAbsent() + 1);
                }

            }

            stat.setTotal(stat.getTotal() + 1);
            statsMap.put(month, stat);
        }

        // Trả về đủ 12 tháng
        List<OverallStatisticEmployeeYearResponse> result = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            result.add(statsMap.getOrDefault(i,
                    OverallStatisticEmployeeYearResponse.builder()
                            .month("T" + i)
                            .present(0)
                            .absent(0)
                            .late(0)
                            .leave(0)
                            .total(0)
                            .build()
            ));
        }

        return result;
    }


    @Override
    public StatisticOverallEmployeeResponse getOverallEmployee( int month, int year) {
        Employee employee = securityUtil.getCurrentUser();
        Object[] result = (Object[]) workShiftAssignmentRepository.getStatisticOverallEmployeeByMonthAndYear(
                employee.getId(),
                month, year
        );

        long totalAssigned = ((Number) result[0]).longValue();
        long present = ((Number) result[1]).longValue();
        double totalHours = result[2] != null ? ((Number) result[2]).doubleValue() : 0.0;


        StatisticOverallEmployeeResponse response = new StatisticOverallEmployeeResponse();
        response.setTotalWorkShiftAssigned((int) totalAssigned);
        response.setOnTimeCount( (int) present );
        response.setTotalWorkingHours(totalHours);

        return response;
    }

    @Override
    public List<LeaveOverallResponse> getLeaveOverallEmployeeStatistics( int year) {
        Employee employee = securityUtil.getCurrentUser();
        List<Object[]> statistic = leaveRequestRepository.getLeaveOverallEmployeeStatistics(employee.getId(), year);
        if (statistic != null && !statistic.isEmpty()) {
            return statistic.stream()
                    .map(rs -> LeaveOverallResponse.builder()
                            .name((String) rs[0])
                            .value(rs[1] != null ? (Integer) rs[1] : 0L)
                            .build())
                    .collect(Collectors.toList());
        }
        return List.of();
    }


}
