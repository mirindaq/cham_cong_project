package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.LeaveRequestConverter;
import com.attendance.fpt.entity.*;
import com.attendance.fpt.enums.AttendanceStatus;
import com.attendance.fpt.enums.LeaveRequestStatus;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.LeaveRequestAddRequest;
import com.attendance.fpt.model.request.LeaveRequestHandleRequest;
import com.attendance.fpt.model.response.*;
import com.attendance.fpt.repositories.*;
import com.attendance.fpt.services.LeaveRequestService;
import com.attendance.fpt.services.NotificationService;
import com.attendance.fpt.utils.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final WorkShiftAssignmentRepository workShiftAssignmentRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final AttendanceRepository attendanceRepository;
    private final WorkShiftRepository workShiftRepository;
    private final SecurityUtil securityUtil;
    private final NotificationService notificationService;
    @Override
    @Transactional
    public LeaveRequestResponse createLeaveRequest(LeaveRequestAddRequest request) {
        Employee employee = securityUtil.getCurrentUser();

        LeaveType leaveType = leaveTypeRepository.findById(request.getLeaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Leave type not found"));

        WorkShift workShift = workShiftRepository.findById(request.getWorkShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Work shift not found"));

        List<WorkShiftAssignment> existingAssignments = workShiftAssignmentRepository.findByEmployee_IdAndDateAssignBetweenAndWorkShift_IdAndAttendanceIsNull(
                employee.getId(),
                request.getStartDate(),
                request.getEndDate(),
                request.getWorkShiftId()
        );

        if (existingAssignments.isEmpty()) {
            throw new ResourceNotFoundException("No work shift assignments found for the employee during the leave period");
        }

        LeaveBalance leaveBalance = leaveBalanceRepository.findByEmployee_IdAndLeaveType_IdAndYear(
                employee.getId(),
                leaveType.getId(),
                request.getStartDate().getYear()
        ).orElseThrow(() -> new ResourceNotFoundException("Leave balance not found"));

        int totalDays = (int) (request.getEndDate().toEpochDay() - request.getStartDate().toEpochDay());

        if (totalDays < 0) {
            throw new IllegalArgumentException("Start date must be before or equal end date");
        }

        if (leaveBalance.getRemainingDay() - totalDays < 0) {
            throw new IllegalStateException("Not enough leave balance for this request");
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .employee(employee)
                .leaveType(leaveType)
                .workShift(workShift)
                .status(LeaveRequestStatus.PENDING)
                .build();

        return LeaveRequestConverter.toResponse(leaveRequestRepository.save(leaveRequest));
    }

    @Override
    @Transactional
    public void recallLeaveRequest(Long id) {
        Employee employee = securityUtil.getCurrentUser();

        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (!leaveRequest.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalStateException("You can only recall your own leave requests");
        }

        if (leaveRequest.getStatus() != LeaveRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot recall a non-pending leave request");
        }

        leaveRequest.setStatus(LeaveRequestStatus.RECALLED);
        leaveRequestRepository.save(leaveRequest);
    }

    @Override
    @Transactional
    public void rejectLeaveRequest(Long id, LeaveRequestHandleRequest leaveRequestHandleRequest) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        Employee employee = securityUtil.getCurrentUser();

        if (leaveRequest.getStatus() != LeaveRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot reject a non-pending leave request");
        }

        leaveRequest.setResponseBy(employee);
        leaveRequest.setResponseNote(leaveRequestHandleRequest.getResponseNote());
        leaveRequest.setResponseDate(LocalDateTime.now());
        leaveRequest.setStatus(LeaveRequestStatus.REJECTED);
        leaveRequestRepository.save(leaveRequest);

        notificationService.sendNotification(employee, "Đơn xin nghỉ phép của bạn ngày " +
                leaveRequest.getStartDate() + " đến " + leaveRequest.getEndDate() + " đã bị từ chối");
    }

    @Override
    @Transactional
    public void approveLeaveRequest(Long id, LeaveRequestHandleRequest leaveRequestHandleRequest) {
        Employee employee = securityUtil.getCurrentUser();

        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (leaveRequest.getStatus() != LeaveRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot approve a non-pending leave request");
        }

        leaveRequest.setStatus(LeaveRequestStatus.APPROVED);
        leaveRequest.setResponseDate(LocalDateTime.now());
        leaveRequest.setResponseNote(leaveRequestHandleRequest.getResponseNote());
        leaveRequest.setResponseBy(employee);
        leaveRequestRepository.save(leaveRequest);

        List<WorkShiftAssignment> wss = workShiftAssignmentRepository.findByEmployee_IdAndDateAssignBetweenAndWorkShift_IdAndAttendanceIsNull(
                leaveRequest.getEmployee().getId(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate(),
                leaveRequest.getWorkShift().getId()
        );

        if (wss.isEmpty()) {
            throw new ResourceNotFoundException("No work shift assignments found for the employee during the leave period");
        }


        List<Attendance> attendanceRecords = wss.stream()
                .map(assignment -> {
                    Attendance attendance = new Attendance();
                    attendance.setWorkShiftAssignment(assignment);
                    attendance.setStatus(AttendanceStatus.LEAVE);
                    attendance.setEmployee(leaveRequest.getEmployee());
                    attendance.setLeaveRequest(leaveRequest);
                    return attendance;
                })
                .collect(Collectors.toList());

        attendanceRepository.saveAll(attendanceRecords);

        int totalDays = wss.size();
        LeaveBalance leaveBalance = leaveBalanceRepository.findByEmployee_IdAndLeaveType_IdAndYear(
                leaveRequest.getEmployee().getId(),
                leaveRequest.getLeaveType().getId(),
                leaveRequest.getStartDate().getYear()
        ).orElseThrow(() -> new ResourceNotFoundException("Leave balance not found"));

        if (leaveBalance.getRemainingDay() - totalDays < 0) {
            throw new IllegalStateException("Not enough leave balance for this request");
        }

        leaveBalance.setUsedDay((leaveBalance.getUsedDay() + totalDays));
        leaveBalance.setRemainingDay(leaveBalance.getRemainingDay() - totalDays);
        leaveBalanceRepository.save(leaveBalance);

        notificationService.sendNotification(leaveRequest.getEmployee(),
                "Đơn xin nghỉ phép của bạn ngày " + leaveRequest.getStartDate() + " đến " +
                        leaveRequest.getEndDate() + " đã được phê duyệt");
    }

    @Override
    public ResponseWithPagination<List<LeaveRequestResponse>> getAllLeaveRequestsByEmployee(int page, int limit) {
        Employee employee = securityUtil.getCurrentUser();
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<LeaveRequest> leaveRequests = leaveRequestRepository.findAllByEmployee_Id(employee.getId(), pageable);

        Page<LeaveRequestResponse> responsePage = leaveRequests.map(LeaveRequestConverter::toResponse);

        return ResponseWithPagination.<List<LeaveRequestResponse>>builder()
                .data(responsePage.getContent())
                .totalItem((int) responsePage.getTotalElements())
                .totalPage(responsePage.getTotalPages())
                .limit(limit)
                .page(page)
                .build();
    }

    @Override
    public List<LeaveRequestResponse> getPendingLeaveRequests() {
        return leaveRequestRepository.findByStatusOrderByCreatedAtAsc(LeaveRequestStatus.PENDING)
                .stream()
                .map(LeaveRequestConverter::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ResponseWithPagination<List<LeaveRequestResponse>> getAllLeaveRequests(
            int page,
            int limit,
            String employeeName,
            LocalDate createDate,
            Long departmentId,
            Long workShiftId,
            Long leaveTypeId,
            String status) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<LeaveRequest> leaveRequestPage = leaveRequestRepository.findAllWithFilters(
                employeeName, createDate, departmentId, workShiftId,
                leaveTypeId, status != null ? LeaveRequestStatus.valueOf(status.toUpperCase()) : null, pageable);

        List<LeaveRequestResponse> leaveRequestResponses = leaveRequestPage.getContent().stream()
                .map(LeaveRequestConverter::toResponse)
                .toList();

        return ResponseWithPagination.<List<LeaveRequestResponse>>builder()
                .data(leaveRequestResponses)
                .totalItem((int) leaveRequestPage.getTotalElements())
                .totalPage(leaveRequestPage.getTotalPages())
                .limit(limit)
                .page(page)
                .build();

    }

}