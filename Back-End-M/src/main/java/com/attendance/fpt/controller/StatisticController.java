package com.attendance.fpt.controller;

import com.attendance.fpt.model.response.AttendanceDailyResponse;
import com.attendance.fpt.model.response.AttendanceWeeklyResponse;
import com.attendance.fpt.model.response.LeaveOverallResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.services.AttendanceService;
import com.attendance.fpt.services.StatisticService;
import com.attendance.fpt.services.WorkShiftAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/statistics")
public class StatisticController {

    private final StatisticService statisticService;
    private final AttendanceService attendanceService;

    @GetMapping("/weekly-attendance")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity< ResponseSuccess<AttendanceWeeklyResponse>> getWeeklyAttendanceStatistics() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get weekly attendance statistics success",
                statisticService.getWeeklyAttendanceStatistics()
        ));
    }

    @GetMapping("/leave-overall")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<List<LeaveOverallResponse>>> getLeaveOverallStatistics() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get leave overall statistics success",
                statisticService.getLeaveOverallStatistics()
        ));
    }

    @GetMapping("/total-leave-in-day")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<Long>> getTotalLeaveInDay() {
        long count = statisticService.getTotalLeaveInDay();
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK, "Get total leave in day success", count));
    }

}
