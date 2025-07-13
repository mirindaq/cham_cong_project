package com.attendance.fpt.utils;

import com.attendance.fpt.repositories.OtpRepository;
import com.attendance.fpt.repositories.WorkShiftAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class TaskSchedule {

    private final OtpRepository otpRepository;
    private final WorkShiftAssignmentRepository workShiftAssignmentRepository;

    @Scheduled(fixedRate = 300000)
    @Transactional
    public void cleanExpiredOTP() {
        otpRepository.deleteAllByExpiresAtBefore(LocalDateTime.now());
        System.out.printf("Expired OTPs cleaned up at %s%n", LocalDateTime.now());
    }

//    @Scheduled(fixedRate = 300000)
    @Scheduled(cron = "@monthly")
    @Transactional
    public void lockAttendanceOnPreviousMonth() {
        LocalDateTime now = LocalDateTime.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        // Tính toán tháng trước và năm tương ứng
        // Nếu tháng hiện tại là tháng 1 (tháng 1 của năm), lấy tháng 12 và năm trước đó
        if (currentMonth == 1) {
            currentMonth = 12;
            currentYear = currentYear - 1;
        } else {
            currentMonth = currentMonth - 1;  // Giảm tháng đi 1 để lấy tháng trước
        }

        workShiftAssignmentRepository.lockAllWorkShiftAssignmentForMonthAndYear(currentMonth, currentYear);
        System.out.printf("Attendance records locked for month %d, year %d at %s%n", currentMonth, currentYear, LocalDateTime.now());
    }

}