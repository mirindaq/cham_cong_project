package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.LeaveRequestConverter;
import com.attendance.fpt.converter.RevertLeaveRequestConverter;
import com.attendance.fpt.entity.*;
import com.attendance.fpt.enums.AttendanceStatus;
import com.attendance.fpt.enums.LeaveRequestStatus;
import com.attendance.fpt.enums.RevertLeaveRequestStatus;
import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.RevertLeaveRequestAddRequest;
import com.attendance.fpt.model.request.RevertLeaveRequestHandleRequest;
import com.attendance.fpt.model.response.LeaveRequestResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.model.response.RevertLeaveRequestResponse;
import com.attendance.fpt.repositories.*;
import com.attendance.fpt.services.EmailService;
import com.attendance.fpt.services.NotificationService;
import com.attendance.fpt.services.RevertLeaveRequestService;
import com.attendance.fpt.utils.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RevertLeaveRequestServiceImpl implements RevertLeaveRequestService {

    private final RevertLeaveRequestRepository revertLeaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final AttendanceRepository attendanceRepository;
    private final WorkShiftRepository workShiftRepository;
    private final WorkShiftAssignmentRepository workShiftAssignmentRepository;
    private final SecurityUtil securityUtil;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Override
    public ResponseWithPagination<List<RevertLeaveRequestResponse>> getAllRevertLeaveRequests(int page, int size, String employeeName, LocalDate createdDate,LocalDate date, Long departmentId, Long workShiftId, String status) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<RevertLeaveRequest> revertLeaveRequestPage = revertLeaveRequestRepository.findAllWithFilters(
                employeeName, createdDate,date, departmentId, workShiftId,
                 status != null ? RevertLeaveRequestStatus.valueOf(status.toUpperCase()) : null, pageable);

        List<RevertLeaveRequestResponse> leaveRequestResponses = revertLeaveRequestPage.getContent().stream()
                .map(RevertLeaveRequestConverter::toResponse)
                .toList();

        return ResponseWithPagination.<List<RevertLeaveRequestResponse>>builder()
                .data(leaveRequestResponses)
                .totalItem((int) revertLeaveRequestPage.getTotalElements())
                .totalPage(revertLeaveRequestPage.getTotalPages())
                .limit(size)
                .page(page)
                .build();
    }

    @Override
    public ResponseWithPagination<List<RevertLeaveRequestResponse>> getAllRevertLeaveRequestsByEmployee(int page, int size) {
        Employee employee = securityUtil.getCurrentUser();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<RevertLeaveRequest> revertLeaveRequests = revertLeaveRequestRepository.findAllByEmployee_Id(employee.getId(), pageable);

        Page<RevertLeaveRequestResponse> responsePage = revertLeaveRequests.map(RevertLeaveRequestConverter::toResponse);

        return ResponseWithPagination.<List<RevertLeaveRequestResponse>>builder()
                .data(responsePage.getContent())
                .totalItem((int) responsePage.getTotalElements())
                .totalPage(responsePage.getTotalPages())
                .limit(size)
                .page(page)
                .build();
    }

    @Override
    @Transactional
    public RevertLeaveRequestResponse createRevertLeaveRequest(RevertLeaveRequestAddRequest revertLeaveRequestAddRequest) {
        Employee employee = securityUtil.getCurrentUser();

        WorkShift workShift = workShiftRepository.findById(revertLeaveRequestAddRequest.getWorkShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Work shift not found"));


        Attendance attendance = attendanceRepository.findByAttendanceLeaveByDateAndWorkShiftIdAndStatus(revertLeaveRequestAddRequest.getDate(),
                        revertLeaveRequestAddRequest.getWorkShiftId()
                        , AttendanceStatus.LEAVE)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance leave not found"));


        RevertLeaveRequest revertLeaveRequest = RevertLeaveRequest.builder()
                .employee(employee)
                .reason(revertLeaveRequestAddRequest.getReason())
                .workShift(workShift)
                .date(revertLeaveRequestAddRequest.getDate())
                .status(RevertLeaveRequestStatus.PENDING)
                .leaveType(attendance.getLeaveRequest().getLeaveType())
                .build();

        return RevertLeaveRequestConverter.toResponse(revertLeaveRequestRepository.save(revertLeaveRequest));
    }

    @Override
    @Transactional
    public void recallRevertLeaveRequest(Long id) {
        Employee employee = securityUtil.getCurrentUser();

        RevertLeaveRequest revertLeaveRequest = revertLeaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Revert leave request not found"));

        if (!revertLeaveRequest.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalStateException("You can only recall your own revert leave requests");
        }

        if (revertLeaveRequest.getStatus() != RevertLeaveRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot recall a non-pending revert leave request");
        }

        revertLeaveRequest.setStatus(RevertLeaveRequestStatus.RECALLED);
        revertLeaveRequestRepository.save(revertLeaveRequest);
    }

    @Override
    @Transactional
    public void approveRevertLeaveRequest(Long id, RevertLeaveRequestHandleRequest revertLeaveRequestHandleRequest) {
        Employee employee = securityUtil.getCurrentUser();

        RevertLeaveRequest revertLeaveRequest = revertLeaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Revert leave request not found"));

        if (revertLeaveRequest.getStatus() != RevertLeaveRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot approve a non-pending revert leave request");
        }


        Attendance attendance = attendanceRepository.findByAttendanceLeaveByDateAndWorkShiftIdAndStatus(revertLeaveRequest.getDate(),
                        revertLeaveRequest.getWorkShift().getId()
                        , AttendanceStatus.LEAVE)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance leave not found"));

        WorkShiftAssignment workShiftAssignment = attendance.getWorkShiftAssignment();
        workShiftAssignment.setAttendance(null);
        workShiftAssignmentRepository.save(workShiftAssignment);

        attendanceRepository.delete(attendance);
        LeaveBalance leaveBalance = leaveBalanceRepository.findByEmployee_IdAndLeaveType_IdAndYear(
                revertLeaveRequest.getEmployee().getId(),
                attendance.getLeaveRequest().getLeaveType().getId(),
                revertLeaveRequest.getDate().getYear()
        ).orElseThrow(() -> new ResourceNotFoundException("Leave balance not found"));


        leaveBalance.setUsedDay((leaveBalance.getUsedDay() - 1));
        leaveBalance.setRemainingDay(leaveBalance.getRemainingDay() + 1);
        leaveBalanceRepository.save(leaveBalance);

        revertLeaveRequest.setStatus(RevertLeaveRequestStatus.APPROVED);
        revertLeaveRequest.setResponseDate(LocalDateTime.now());
        revertLeaveRequest.setResponseNote(revertLeaveRequestHandleRequest.getResponseNote());
        revertLeaveRequest.setResponseBy(employee);
        revertLeaveRequestRepository.save(revertLeaveRequest);

        notificationService.sendNotification(revertLeaveRequest.getEmployee(), "Đơn xin đi làm lại ngày " + revertLeaveRequest.getDate() + " đã được phê duyệt");

        String message = "Đơn xin đi làm lại vào ngày " + revertLeaveRequest.getDate() + " của bạn đã được phê duyệt. "
                + "Bạn sẽ quay lại làm việc theo ca từ "
                + revertLeaveRequest.getWorkShift().getStartTime()
                + " đến " + revertLeaveRequest.getWorkShift().getEndTime() + ".";

        if (revertLeaveRequestHandleRequest.getResponseNote() != null && !revertLeaveRequestHandleRequest.getResponseNote().isBlank()) {
            message += " Ghi chú từ quản lý: " + revertLeaveRequestHandleRequest.getResponseNote();
        }

        emailService.sendApprovalEmail(
                revertLeaveRequest.getEmployee().getEmail(),
                message,
                true
        );


    }

    @Override
    @Transactional
    public void rejectRevertLeaveRequest(Long id, RevertLeaveRequestHandleRequest revertLeaveRequestHandleRequest) {
        Employee employee = securityUtil.getCurrentUser();

        RevertLeaveRequest revertLeaveRequest = revertLeaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Revert leave request not found"));


        if (revertLeaveRequest.getStatus() != RevertLeaveRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot reject a non-pending revert leave request");
        }

        revertLeaveRequest.setResponseBy(employee);
        revertLeaveRequest.setResponseNote(revertLeaveRequestHandleRequest.getResponseNote());
        revertLeaveRequest.setResponseDate(LocalDateTime.now());
        revertLeaveRequest.setStatus(RevertLeaveRequestStatus.REJECTED);
        revertLeaveRequestRepository.save(revertLeaveRequest);

        notificationService.sendNotification(revertLeaveRequest.getEmployee(), "Đơn xin đi làm lại ngày " + revertLeaveRequest.getDate() + " đã bị từ chối");

        String message = "Đơn xin đi làm lại vào ngày " + revertLeaveRequest.getDate() + " của bạn đã bị từ chối.";

        if (revertLeaveRequestHandleRequest.getResponseNote() != null && !revertLeaveRequestHandleRequest.getResponseNote().isBlank()) {
            message += " Lý do: " + revertLeaveRequestHandleRequest.getResponseNote();
        }

        emailService.sendApprovalEmail(
                revertLeaveRequest.getEmployee().getEmail(),
                message,
                false
        );

    }
}
