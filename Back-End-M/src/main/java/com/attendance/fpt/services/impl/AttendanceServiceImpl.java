package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.AttendanceWorkShiftConverter;
import com.attendance.fpt.entity.Attendance;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.entity.Location;
import com.attendance.fpt.entity.WorkShiftAssignment;
import com.attendance.fpt.enums.AttendanceStatus;
import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.CheckInRequest;
import com.attendance.fpt.model.request.CheckOutRequest;
import com.attendance.fpt.model.response.AttendanceWorkShiftResponse;
import com.attendance.fpt.repositories.AttendanceRepository;
import com.attendance.fpt.repositories.EmployeeRepository;
import com.attendance.fpt.repositories.LocationRepository;
import com.attendance.fpt.repositories.WorkShiftAssignmentRepository;
import com.attendance.fpt.services.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
     private final WorkShiftAssignmentRepository workShiftAssignmentRepository;
    private final EmployeeRepository employeeRepository;
    private final LocationRepository locationRepository;

    @Override
    public List<AttendanceWorkShiftResponse> getAttendanceAndShiftAssignmentByEmployeeId(Long employeeId, Long month, Long year) {
        if (month == null) {
            month = (long) LocalDate.now().getMonthValue();
        }
        if (year == null) {
            year = (long) LocalDate.now().getYear();
        }
        if (employeeId == null || month < 1 || month > 12 || year < 1900) {
            throw new IllegalArgumentException("Invalid input parameters");
        }

       List<WorkShiftAssignment> workShiftAssignments =
               workShiftAssignmentRepository.findAllByEmployeeAndMonthAndYear(employeeId, month, year);
       List<Attendance> attendances = attendanceRepository.findAllByEmployeeAndMonthAndYear(employeeId, month, year);

        if (workShiftAssignments.isEmpty() && attendances.isEmpty()) {
            return List.of();
        }

        return workShiftAssignments.stream()
                .map(assignment -> {
                    Attendance attendance = attendances.stream()
                            .filter(a -> a.getWorkShiftAssignment().getId().equals(assignment.getId()))
                            .findFirst()
                            .orElse(null);

                    if ( attendance == null ) return AttendanceWorkShiftConverter.toResponseNoHaveAttendance(assignment);
                    return AttendanceWorkShiftConverter.toResponseHaveAttendance(assignment, attendance);
                })
                .toList();

    }

    @Transactional
    @Override
    public AttendanceWorkShiftResponse checkIn(CheckInRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        // Kiểm tra vị trí
        if (location.getLatitude() != null && location.getLongitude() != null) {
            double distance = calculateDistance(
                    request.getLatitude(),
                    request.getLongitude(),
                    location.getLatitude(),
                    location.getLongitude()
            );

            if (distance > location.getRadius()) {
                throw new RuntimeException(
                        String.format("Bạn đang ở cách địa điểm %s khoảng %.0fm, vượt quá bán kính cho phép (%dm)",
                                location.getName(),
                                distance,
                                location.getRadius()
                        )
                );
            }
        }

        LocalDateTime now = LocalDateTime.now();
        LocalTime currentTime = now.toLocalTime();

        // Tìm ca làm việc hiện tại của nhân viên
        WorkShiftAssignment currentShift = workShiftAssignmentRepository
                .findCurrentShiftAssignment(request.getEmployeeId(), now.toLocalDate(), currentTime)
                .orElseThrow(() -> new ResourceNotFoundException("No active shift found"));

        if ( currentShift.getAttendance() != null ) {
            throw new ConflictException("Bạn đã chấm công vào ca làm việc này rồi");
        }

        AttendanceStatus status = AttendanceStatus.PRESENT;
        Integer lateMinutes = 0;

        if (currentTime.isAfter(currentShift.getWorkShift().getStartTime())) {

            lateMinutes = calculateLateMinutes(currentTime, currentShift.getWorkShift().getStartTime());
            if (lateMinutes >= 10) {
                status = AttendanceStatus.LATE;
            }
        }

        // Tạo bản ghi chấm công mới
        Attendance attendance = Attendance.builder()
                .checkInTime(now)
                .checkOutTime(null)
                .totalHours(0.0)
                .status(status)
                .lateMinutes(lateMinutes)
                .edited(false)
                .locked(false)
                .employee(employee)
                .location(location)
                .workShiftAssignment(currentShift)
                .location(location)
                .build();

        return AttendanceWorkShiftConverter.toResponseHaveAttendance(attendance.getWorkShiftAssignment(), attendanceRepository.save(attendance));
    }

    @Transactional
    @Override
    public AttendanceWorkShiftResponse checkOut(CheckOutRequest checkOutRequest) {
        Employee employee = employeeRepository.findById(checkOutRequest.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        LocalDateTime now = LocalDateTime.now();

        Attendance attendance = attendanceRepository.findByIdAndEmployee_Id(checkOutRequest.getAttendanceId(), employee.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No check-in record found"));

        if (attendance.getCheckOutTime() != null) {
            throw new ConflictException("Already checked out today");
        }
        attendance.setCheckOutTime(now);

        double totalHours = calculateTotalHours(attendance.getCheckInTime(), now);
        attendance.setTotalHours(totalHours);

        return AttendanceWorkShiftConverter.toResponseHaveAttendance(attendance.getWorkShiftAssignment(),attendanceRepository.save(attendance));
    }

    @Override
    public List<AttendanceWorkShiftResponse> getAllAttendances() {
    List<Attendance> attendances = attendanceRepository.findAll();
        if (!attendances.isEmpty()) {
            return attendances.stream()
                    .map(attendance -> AttendanceWorkShiftConverter.toResponseHaveAttendance(
                            attendance.getWorkShiftAssignment(), attendance))
                    .toList();
        }
        return List.of();
    }

    @Override
    public List<AttendanceWorkShiftResponse> getRecentCheckers() {
        List<Attendance> recentAttendances = attendanceRepository.findRecentCheckers();
        if (!recentAttendances.isEmpty()) {
            return recentAttendances.stream()
                    .map(attendance -> AttendanceWorkShiftConverter.toResponseHaveAttendance(
                            attendance.getWorkShiftAssignment(), attendance))
                    .toList();
        }
        return List.of();
    }

    private Integer calculateLateMinutes(LocalTime checkInTime, LocalTime shiftStartTime) {
        return (int) java.time.Duration.between(shiftStartTime, checkInTime).toMinutes();
    }

    private double calculateTotalHours(LocalDateTime checkIn, LocalDateTime checkOut) {
        return java.time.Duration.between(checkIn, checkOut).toMinutes() / 60.0;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c * 1000;
    }

}
