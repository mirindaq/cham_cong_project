package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.RemoteWorkRequestConverter;
import com.attendance.fpt.entity.*;
import com.attendance.fpt.enums.AttendanceStatus;
import com.attendance.fpt.enums.EmployeeType;
import com.attendance.fpt.enums.RemoteWorkRequestStatus;
import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.RemoteWorkRequestAddRequest;
import com.attendance.fpt.model.request.RemoteWorkRequestHandleRequest;
import com.attendance.fpt.model.response.RemoteWorkRequestResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.repositories.AttendanceRepository;
import com.attendance.fpt.repositories.RemoteWorkRequestRepository;
import com.attendance.fpt.repositories.WorkShiftAssignmentRepository;
import com.attendance.fpt.repositories.WorkShiftRepository;
import com.attendance.fpt.services.EmailService;
import com.attendance.fpt.services.NotificationService;
import com.attendance.fpt.services.RemoteWorkRequestService;
import com.attendance.fpt.utils.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RemoteWorkRequestServiceImpl implements RemoteWorkRequestService {

    private final WorkShiftRepository workShiftRepository;
    private final RemoteWorkRequestRepository remoteWorkRequestRepository;
    private final SecurityUtil securityUtil;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final WorkShiftAssignmentRepository workShiftAssignmentRepository;
    private final AttendanceRepository attendanceRepository;

    @Override
    public ResponseWithPagination<List<RemoteWorkRequestResponse>> getAllRemoteWorkRequests(int page, int size, String employeeName,
                                                                                            LocalDate createdDate, LocalDate date,
                                                                                            Long departmentId,Long workShiftId, String status) {

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<RemoteWorkRequest> remoteWorkRequestPage = remoteWorkRequestRepository.findAllWithFilters(
                employeeName,
                createdDate,
                date,
                departmentId,
                workShiftId,
                status != null ? RemoteWorkRequestStatus.valueOf(status.toUpperCase()) : null,
                pageable
        );

        List<RemoteWorkRequestResponse> responseList = remoteWorkRequestPage.getContent().stream()
                .map(RemoteWorkRequestConverter::toResponse)
                .toList();

        return ResponseWithPagination.<List<RemoteWorkRequestResponse>>builder()
                .data(responseList)
                .totalItem((int) remoteWorkRequestPage.getTotalElements())
                .totalPage(remoteWorkRequestPage.getTotalPages())
                .limit(size)
                .page(page)
                .build();
    }

    @Override
    public ResponseWithPagination<List<RemoteWorkRequestResponse>> getAllRemoteWorkRequestsByEmployee(int page, int size) {
        Employee employee = securityUtil.getCurrentUser();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<RemoteWorkRequest> requestPage = remoteWorkRequestRepository.findAllByEmployee_Id(employee.getId(), pageable);
        Page<RemoteWorkRequestResponse> responsePage = requestPage.map(RemoteWorkRequestConverter::toResponse);

        return ResponseWithPagination.<List<RemoteWorkRequestResponse>>builder()
                .data(responsePage.getContent())
                .totalItem((int) responsePage.getTotalElements())
                .totalPage(responsePage.getTotalPages())
                .limit(size)
                .page(page)
                .build();
    }

    @Override
    public RemoteWorkRequestResponse createRemoteWorkRequest(RemoteWorkRequestAddRequest request) {
        Employee employee = securityUtil.getCurrentUser();

        WorkShift workShift = workShiftRepository.findById(request.getWorkShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Work shift with ID " + request.getWorkShiftId() + " does not exist."));

        LocalDate requestDate = request.getDate();
        LocalTime nowTime = LocalTime.now();

        if (requestDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot create remote work request for a past date.");
        }

        if (requestDate.isEqual(LocalDate.now()) && workShift.getEndTime().isBefore(nowTime)) {
            throw new IllegalArgumentException("Cannot create remote work request for a shift that has already ended.");
        }


        RemoteWorkRequest remoteRequest = RemoteWorkRequest.builder()
                .date(request.getDate())
                .employee(employee)
                .reason(request.getReason())
                .status(RemoteWorkRequestStatus.PENDING)
                .workShift(workShift)
                .build();

        return RemoteWorkRequestConverter.toResponse(remoteWorkRequestRepository.save(remoteRequest));
    }

    @Override
    public void recallRemoteWorkRequest(Long id) {
        Employee employee = securityUtil.getCurrentUser();
        RemoteWorkRequest request = remoteWorkRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remote work request not found"));

        if (!request.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("You can only recall your own requests.");
        }

        if (request.getStatus() != RemoteWorkRequestStatus.PENDING) {
            throw new ConflictException("Only pending requests can be recalled.");
        }

        request.setStatus(RemoteWorkRequestStatus.RECALLED);
        remoteWorkRequestRepository.save(request);
    }

    private double calculateTotalHours(LocalTime startTime, LocalTime endTime) {
        return Duration.between(startTime, endTime).toMinutes() / 60.0;
    }


    @Override
    public void approveRemoteWorkRequest(Long id, RemoteWorkRequestHandleRequest handleRequest) {
        Employee approver = securityUtil.getCurrentUser();
        RemoteWorkRequest request = remoteWorkRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remote work request not found"));

        if (request.getStatus() != RemoteWorkRequestStatus.PENDING) {
            throw new ConflictException("Only pending requests can be approved.");
        }

        WorkShiftAssignment workShiftAssignment = workShiftAssignmentRepository.findByWorkShiftAndDateAssignAndEmployee(
                request.getWorkShift(), request.getDate(), request.getEmployee())
                .orElseThrow(() -> new ResourceNotFoundException("Work shift assignment not found."));

        if ( workShiftAssignment.getDateAssign().isBefore(LocalDate.now()) ||
                (workShiftAssignment.getDateAssign().isEqual(LocalDate.now()) &&
                        workShiftAssignment.getWorkShift().getStartTime().isBefore(LocalTime.now()))) {
            throw new ConflictException("Cannot approve remote work request for past time.");
        }

        if ( workShiftAssignment.getAttendance() != null &&
                workShiftAssignment.getAttendance().getStatus() == AttendanceStatus.LEAVE) {
            throw new ConflictException("Cannot approve remote work request when attendance already leave for this shift.");
        }

        if (workShiftAssignment.getAttendance() == null) {
            Attendance attendance = Attendance.builder()
                    .employee(request.getEmployee())
                    .workShiftAssignment(workShiftAssignment)
                    .checkInTime(request.getDate().atTime(request.getWorkShift().getStartTime()))
                    .checkOutTime(request.getDate().atTime(request.getWorkShift().getEndTime()))
                    .totalHours(calculateTotalHours(request.getWorkShift().getStartTime(), request.getWorkShift().getEndTime()))
                    .status(AttendanceStatus.PRESENT)
                    .edited(false)
                    .build();

            attendanceRepository.save(attendance);
        }

        request.setStatus(RemoteWorkRequestStatus.APPROVED);
        request.setResponseBy(approver);
        request.setResponseDate(LocalDateTime.now());
        request.setResponseNote(handleRequest.getResponseNote());
        remoteWorkRequestRepository.save(request);

        notificationService.sendNotification(request.getEmployee(),
                "Đơn xin làm việc từ xa ngày " + request.getDate() + " đã được phê duyệt.");

        String message = "Đơn xin làm việc từ xa của bạn ngày " + request.getDate() + " đã được phê duyệt.";
        if (handleRequest.getResponseNote() != null && !handleRequest.getResponseNote().isBlank()) {
            message += " Ghi chú từ quản lý: " + handleRequest.getResponseNote();
        }

        emailService.sendApprovalEmail(request.getEmployee().getEmail(), message, true);
    }

    @Override
    public void rejectRemoteWorkRequest(Long id, RemoteWorkRequestHandleRequest handleRequest) {
        Employee approver = securityUtil.getCurrentUser();
        RemoteWorkRequest request = remoteWorkRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remote work request not found"));

        if (request.getStatus() != RemoteWorkRequestStatus.PENDING) {
            throw new ConflictException("Only pending requests can be rejected.");
        }

        request.setStatus(RemoteWorkRequestStatus.REJECTED);
        request.setResponseBy(approver);
        request.setResponseDate(LocalDateTime.now());
        request.setResponseNote(handleRequest.getResponseNote());
        remoteWorkRequestRepository.save(request);

        notificationService.sendNotification(request.getEmployee(),
                "Đơn xin làm việc từ xa ngày " + request.getDate() + " đã bị từ chối.");

        String message = "Đơn xin làm việc từ xa của bạn ngày " + request.getDate() + " đã bị từ chối.";
        if (handleRequest.getResponseNote() != null && !handleRequest.getResponseNote().isBlank()) {
            message += " Lý do: " + handleRequest.getResponseNote();
        }

        emailService.sendApprovalEmail(request.getEmployee().getEmail(), message, false);
    }
}
