package com.attendance.fpt.controller;

import com.attendance.fpt.model.response.*;
import com.attendance.fpt.services.AttendanceService;
import com.attendance.fpt.services.StatisticService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/statistics")
public class StatisticController {

    private final StatisticService statisticService;

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

    @GetMapping("/top-five-staff-attendance/{month}/{year}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<List<TopStaffAttendanceResponse>>> getTopFiveStaffAttendanceByMonth(
            @PathVariable("month") int month,
            @PathVariable("year") int year
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Get top staff attendance",
                statisticService.getTopFiveStaffAttendanceByMonth(month,year)));
    }

    @GetMapping("/overall/{month}/{year}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<List<OverallStatisticMonthResponse>>> getOverallByMonth(
            @PathVariable("month") int month,
            @PathVariable("year") int year
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Get top staff attendance",
                statisticService.getOverallByMonth(month,year)));
    }

    @GetMapping("/leave-overall/{month}/{year}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<List<LeaveOverallResponse>>> getLeaveOverallStatisticsByMonth(@PathVariable("month") int month,
                                                                                                        @PathVariable("year") int year) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get leave overall statistics by month success",
                statisticService.getLeaveOverallStatisticsByMonth(month,year)
        ));
    }

    @GetMapping("/export/{month}/{year}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public void exportStatisticToExcel(
            @PathVariable("month") int month,
            @PathVariable("year") int year,
            HttpServletResponse response) throws IOException {
        response.setContentType("application/octet-stream");
        DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
        String currentDateTime = dateFormatter.format(new Date());

        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=ThongKeThang_" + currentDateTime + ".xlsx";
        response.setHeader(headerKey, headerValue);

        statisticService.exportStatisticToExcel(
                month,
                year,
                response
        );
    }

}
