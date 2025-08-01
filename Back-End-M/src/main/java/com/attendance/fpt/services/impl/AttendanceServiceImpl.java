package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.AttendanceWorkShiftConverter;
import com.attendance.fpt.entity.*;
import com.attendance.fpt.enums.AttendanceStatus;
import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.AttendanceUpdateRequest;
import com.attendance.fpt.model.request.CheckInRequest;
import com.attendance.fpt.model.request.CheckOutRequest;
import com.attendance.fpt.model.response.AttendanceWorkShiftResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.repositories.AttendanceRepository;
import com.attendance.fpt.repositories.EmployeeRepository;
import com.attendance.fpt.repositories.LocationRepository;
import com.attendance.fpt.repositories.WorkShiftAssignmentRepository;
import com.attendance.fpt.services.AttendanceService;
import com.attendance.fpt.services.UploadService;
import com.attendance.fpt.utils.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final WorkShiftAssignmentRepository workShiftAssignmentRepository;
    private final EmployeeRepository employeeRepository;
    private final LocationRepository locationRepository;
    private final SecurityUtil securityUtil;
    private final UploadService uploadService;

    @Override
    public List<AttendanceWorkShiftResponse> getAttendanceAndShiftAssignmentByEmployee(Long month, Long year) {
        if (month == null) {
            month = (long) LocalDate.now().getMonthValue();
        }
        if (year == null) {
            year = (long) LocalDate.now().getYear();
        }
        Employee employee = securityUtil.getCurrentUser();
        if ( month < 1 || month > 12 || year < 1900) {
            throw new IllegalArgumentException("Invalid input parameters");
        }

        List<WorkShiftAssignment> workShiftAssignments =
                workShiftAssignmentRepository.findAllByEmployeeAndMonthAndYear(employee.getId(), month, year);
        List<Attendance> attendances = attendanceRepository.findAllByEmployeeAndMonthAndYear(employee.getId(), month, year);

        if (workShiftAssignments.isEmpty() && attendances.isEmpty()) {
            return List.of();
        }

        return workShiftAssignments.stream()
                .map(assignment -> {
                    Attendance attendance = attendances.stream()
                            .filter(a -> a.getWorkShiftAssignment().getId().equals(assignment.getId()))
                            .findFirst()
                            .orElse(null);

                    if (attendance == null) return AttendanceWorkShiftConverter.toResponseNoHaveAttendance(assignment);
                    return AttendanceWorkShiftConverter.toResponseHaveAttendance(assignment, attendance);
                })
                .toList();

    }

    @Transactional
    @Override
    public AttendanceWorkShiftResponse checkIn(CheckInRequest request) {
        Employee employee = securityUtil.getCurrentUser();

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
                .findCurrentShiftAssignment(employee.getId(), now.toLocalDate(), currentTime)
                .orElseThrow(() -> new ResourceNotFoundException("No active shift found"));

        if (currentShift.getAttendance() != null) {
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

        if (request.getFile() == null || request.getFile().isEmpty()) {
            throw new IllegalArgumentException("Image file is required for check-in");
        }

        Attendance attendance = Attendance.builder()
                .checkInTime(now)
                .checkOutTime(null)
                .totalHours(0.0)
                .status(status)
                .lateMinutes(lateMinutes)
                .edited(false)
                .employee(employee)
                .location(location)
                .workShiftAssignment(currentShift)
                .location(location)
                .image(request.getFile())
                .build();

        return AttendanceWorkShiftConverter.toResponseHaveAttendance(attendance.getWorkShiftAssignment(), attendanceRepository.save(attendance));
    }

    @Transactional
    @Override
    public AttendanceWorkShiftResponse checkOut(CheckOutRequest checkOutRequest) {
        Employee employee = securityUtil.getCurrentUser();

        LocalDateTime now = LocalDateTime.now();

        Attendance attendance = attendanceRepository.findByIdAndEmployee_Id(checkOutRequest.getAttendanceId(), employee.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No check-in record found"));

        if (attendance.getCheckOutTime() != null) {
            throw new ConflictException("Already checked out today");
        }
        attendance.setCheckOutTime(now);

        double totalHours = calculateTotalHours(attendance.getCheckInTime(), now);
        attendance.setTotalHours(totalHours);

        return AttendanceWorkShiftConverter.toResponseHaveAttendance(attendance.getWorkShiftAssignment(), attendanceRepository.save(attendance));
    }


    @Override
    public ResponseWithPagination<List<AttendanceWorkShiftResponse>> getAllAttendances(String employeeName,
                                                                                       LocalDate date,
                                                                                       String status,
                                                                                       int page,
                                                                                       int limit) {
        Sort sort = Sort.by("dateAssign").descending()
                .and(Sort.by("workShift.endTime").descending());

        Pageable pageable = PageRequest.of(page - 1, limit, sort);
        Page<WorkShiftAssignment> wsa;
        if (status != null && status.equals("ABSENT")){
             wsa = workShiftAssignmentRepository.getAllWorkShiftAttendanceByFilterAndAbsent(
                    employeeName,
                    date,
                    pageable);
        } else {
            wsa = workShiftAssignmentRepository.getAllWorkShiftAttendanceByFilter(
                    employeeName,
                    date,
                    status != null ? AttendanceStatus.valueOf(status.toUpperCase()) : null,
                    pageable);
        }


        List<AttendanceWorkShiftResponse> rs = new ArrayList<>();
        if (!wsa.getContent().isEmpty()) {
            rs = wsa.getContent().stream()
                    .map( workShiftAssignment -> {
                        if (workShiftAssignment.getAttendance() == null) {
                            return AttendanceWorkShiftConverter.toResponseNoHaveAttendance(workShiftAssignment);
                        }
                        return AttendanceWorkShiftConverter.toResponseHaveAttendance(workShiftAssignment, workShiftAssignment.getAttendance());
                    })
                    .toList();
        }

        return ResponseWithPagination.<List<AttendanceWorkShiftResponse>>builder()
                .data(rs)
                .totalItem((int) wsa.getTotalElements())
                .totalPage(wsa.getTotalPages())
                .limit(limit)
                .page(page)
                .build();
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

    private Attendance createAttendanceForUpdate( WorkShiftAssignment workShiftAssignment ){
        Attendance attendance = Attendance.builder()
                .employee(workShiftAssignment.getEmployee())
                .workShiftAssignment(workShiftAssignment)
                .build();

        workShiftAssignment.setAttendance(attendance);
        workShiftAssignmentRepository.save(workShiftAssignment);
        return attendanceRepository.save(attendance );
    }

    @Override
    @Transactional
    public AttendanceWorkShiftResponse updateAttendance(Long workShiftAssignmentId, AttendanceUpdateRequest attendanceUpdateRequest) {
        Employee employee = securityUtil.getCurrentUser();

        WorkShiftAssignment workShiftAssignment = workShiftAssignmentRepository.findById(workShiftAssignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Work shift assignment not found"));

        Attendance attendance = workShiftAssignment.getAttendance() != null ? workShiftAssignment.getAttendance() :
                createAttendanceForUpdate(workShiftAssignment);

        if ( workShiftAssignment.isLocked() ) {
            throw new IllegalArgumentException("Attendance record is locked and cannot be edited");
        }

        if (workShiftAssignment.getDateAssign().isBefore(LocalDate.now().minusDays(5))) {
            throw new IllegalArgumentException("Cannot edit attendance record for dates older than 5 days.");
        }

        if (attendanceUpdateRequest.getCheckInTime() != null) {
            LocalDate dateAssign = attendance.getWorkShiftAssignment().getDateAssign();
            LocalTime checkInTime = attendanceUpdateRequest.getCheckInTime();
            LocalDateTime checkInDateTime = dateAssign.atTime(checkInTime);
            attendance.setCheckInTime(checkInDateTime);
        }

        if (attendanceUpdateRequest.getCheckOutTime() != null) {
            LocalDate dateAssign = attendance.getWorkShiftAssignment().getDateAssign();
            LocalTime checkOutTime = attendanceUpdateRequest.getCheckOutTime();
            LocalDateTime checkOutDateTime = dateAssign.atTime(checkOutTime);
            attendance.setCheckOutTime(checkOutDateTime);
        }

        if (attendance.getCheckInTime() != null && attendance.getCheckOutTime() != null) {
            if (attendance.getCheckOutTime().isBefore(attendance.getCheckInTime())) {
                throw new IllegalArgumentException("Check-out time must be after check-in time.");
            }

            Duration duration = Duration.between(attendance.getCheckInTime(), attendance.getCheckOutTime());
            double hours = duration.toMinutes() / 60.0;
            attendance.setTotalHours(hours);
        }

        // tinh so phut di tre
        if (attendance.getCheckInTime() != null) {
            WorkShift workShift = attendance.getWorkShiftAssignment().getWorkShift();
            LocalDateTime officialStartDateTime = workShift.getStartTime().atDate(attendance.getCheckInTime().toLocalDate()); // Set the date of the attendance check-in time
            LocalDateTime lateThresholdDateTime = officialStartDateTime.plusMinutes(15);
            LocalDateTime actualCheckInDateTime = attendance.getCheckInTime();

            // Check if actualCheckInDateTime is after lateThresholdDateTime
            if (actualCheckInDateTime.isAfter(lateThresholdDateTime)) {
                long lateMinutes = Duration.between(lateThresholdDateTime, actualCheckInDateTime).toMinutes();
                attendance.setLateMinutes((int) lateMinutes);
                attendance.setStatus(AttendanceStatus.LATE);
            } else {
                attendance.setLateMinutes(0);
                attendance.setStatus(AttendanceStatus.PRESENT);
            }
        }


        attendance.setImage(attendanceUpdateRequest.getFile());
        attendance.setEdited(true);
        attendance.setEditedBy(employee.getFullName());
        attendance.setEditedTime(LocalDateTime.now());

        Location location = locationRepository.findByName(attendanceUpdateRequest.getLocationName())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));
        attendance.setLocation(location);

        return AttendanceWorkShiftConverter.toResponseHaveAttendance(attendance.getWorkShiftAssignment(), attendanceRepository.save(attendance));
    }

    @Override
    public AttendanceWorkShiftResponse getAttendanceById(Long attendanceId) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found"));

        return AttendanceWorkShiftConverter.toResponseHaveAttendance(attendance.getWorkShiftAssignment(), attendance);
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
