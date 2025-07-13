package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.RevertLeaveRequestConverter;
import com.attendance.fpt.converter.ShiftChangeRequestConverter;
import com.attendance.fpt.entity.*;
import com.attendance.fpt.enums.RevertLeaveRequestStatus;
import com.attendance.fpt.enums.ShiftChangeRequestStatus;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.ShiftChangeAddRequest;
import com.attendance.fpt.model.request.ShiftChangeRequestHandleRequest;
import com.attendance.fpt.model.request.WorkShiftAssignmentListRequest;
import com.attendance.fpt.model.request.WorkShiftAssignmentRequest;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.model.response.RevertLeaveRequestResponse;
import com.attendance.fpt.model.response.ShiftChangeRequestResponse;
import com.attendance.fpt.repositories.EmployeeRepository;
import com.attendance.fpt.repositories.ShiftChangeRequestRepository;
import com.attendance.fpt.repositories.WorkShiftAssignmentRepository;
import com.attendance.fpt.repositories.WorkShiftRepository;
import com.attendance.fpt.services.EmailService;
import com.attendance.fpt.services.NotificationService;
import com.attendance.fpt.services.ShiftChangeRequestService;
import com.attendance.fpt.services.WorkShiftAssignmentService;
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
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShiftChangeRequestServiceImpl implements ShiftChangeRequestService {

    private final SecurityUtil securityUtil;
    private final EmployeeRepository employeeRepository;
    private final WorkShiftRepository workShiftRepository;
    private final ShiftChangeRequestRepository shiftChangeRequestRepository;
    private final WorkShiftAssignmentRepository workShiftAssignmentRepository;
    private final WorkShiftAssignmentService workShiftAssignmentService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Override
    @Transactional
    public ShiftChangeRequestResponse createShiftChangeRequest(ShiftChangeAddRequest shiftChangeAddRequest) {
        Employee employee = securityUtil.getCurrentUser();

        Employee targetEmployee = employeeRepository.findByEmail(shiftChangeAddRequest.getTargetEmployeeEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Target employee not found"));


        if (targetEmployee.getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Cannot create a shift change request for yourself");
        }

        WorkShift workShift = workShiftRepository.findById(shiftChangeAddRequest.getWorkShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Work shift not found"));

        if ((shiftChangeAddRequest.getDate().isBefore(LocalDate.now())) ||
                (shiftChangeAddRequest.getDate().isEqual(LocalDate.now()) && workShift.getStartTime().isBefore(LocalTime.now()))) {
            throw new IllegalArgumentException("Shift change request date cannot be in the past");
        }


        ShiftChangeRequest shiftChangeRequest = ShiftChangeRequest.builder()
                .date(shiftChangeAddRequest.getDate())
                .reason(shiftChangeAddRequest.getReason())
                .workShift(workShift)
                .targetEmployee(targetEmployee)
                .employee(employee)
                .status(ShiftChangeRequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        return ShiftChangeRequestConverter.toResponse(shiftChangeRequestRepository.save(shiftChangeRequest));
    }

    @Override
    public ResponseWithPagination<List<ShiftChangeRequestResponse>> getAllSentShiftChangeRequests(int page, int size) {
        Employee employee = securityUtil.getCurrentUser();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<ShiftChangeRequest> shiftChangePage = shiftChangeRequestRepository.findAllByEmployee_Id(employee.getId(), pageable);

        return ResponseWithPagination.<List<ShiftChangeRequestResponse>>builder()
                .totalItem((int) shiftChangePage.getTotalElements())
                .totalPage(shiftChangePage.getTotalPages())
                .limit(size)
                .page(page)
                .data(shiftChangePage.getContent().stream()
                        .map(ShiftChangeRequestConverter::toResponse)
                        .toList())
                .build();
    }

    @Override
    public ResponseWithPagination<List<ShiftChangeRequestResponse>> getAllReceivedShiftChangeRequests(int page, int size) {
        Employee employee = securityUtil.getCurrentUser();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<ShiftChangeRequest> shiftChangePage = shiftChangeRequestRepository.findAllByTargetEmployee_IdAndStatusNotIn
                (employee.getId(), List.of(ShiftChangeRequestStatus.RECALLED), pageable);

        return ResponseWithPagination.<List<ShiftChangeRequestResponse>>builder()
                .totalItem((int) shiftChangePage.getTotalElements())
                .totalPage(shiftChangePage.getTotalPages())
                .limit(size)
                .page(page)
                .data(shiftChangePage.getContent().stream()
                        .map(ShiftChangeRequestConverter::toResponse)
                        .toList())
                .build();
    }

    private boolean checkDateShiftChangeRequest( ShiftChangeRequest shiftChangeRequest) {
        LocalDate requestDate = shiftChangeRequest.getDate();
        LocalTime startTime = shiftChangeRequest.getWorkShift().getStartTime();

        if (requestDate.isBefore(LocalDate.now())) {
            return false;
        }

        if (requestDate.isEqual(LocalDate.now()) && startTime.isBefore(LocalTime.now())) {
            return false;
        }

        return true;
    }

    @Override
    @Transactional
    public void recallShiftChangeRequest(Long id) {
        Employee employee = securityUtil.getCurrentUser();

        ShiftChangeRequest shiftChangeRequest = shiftChangeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift change request not found"));

        if (!shiftChangeRequest.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalStateException("You can only recall your own shift change request");
        }

        if (shiftChangeRequest.getStatus() != ShiftChangeRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot recall a non-pending revert leave request");
        }

        shiftChangeRequest.setStatus(ShiftChangeRequestStatus.RECALLED);
        shiftChangeRequestRepository.save(shiftChangeRequest);
    }

    @Override
    public void employeeApproveShiftChangeRequest(Long id) {
        Employee employee = securityUtil.getCurrentUser();

        ShiftChangeRequest shiftChangeRequest = shiftChangeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift change request not found"));

        if (!shiftChangeRequest.getTargetEmployee().getId().equals(employee.getId())) {
            throw new IllegalStateException("You can only handle your own shift change request");
        }

        if (shiftChangeRequest.getStatus() != ShiftChangeRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot approve a non-pending shift change request");
        }

        if ( !checkDateShiftChangeRequest(shiftChangeRequest) ){
            throw  new IllegalStateException("Cannot approve shift change request with past date or work shift that has already started");
        }

       if(!workShiftAssignmentRepository.existsByWorkShiftAndDateAssignAndEmployee(
                shiftChangeRequest.getWorkShift(), shiftChangeRequest.getDate(),  shiftChangeRequest.getTargetEmployee())){
            throw new IllegalStateException("You cannot have work shift required for this shift change request");
       }

        shiftChangeRequest.setStatus(ShiftChangeRequestStatus.PENDING_APPROVAL);
        shiftChangeRequestRepository.save(shiftChangeRequest);

    }

    @Override
    public void employeeRejectShiftChangeRequest(Long id) {
        Employee employee = securityUtil.getCurrentUser();

        ShiftChangeRequest shiftChangeRequest = shiftChangeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift change request not found"));

        if (!shiftChangeRequest.getTargetEmployee().getId().equals(employee.getId())) {
            throw new IllegalStateException("You can only handle your own shift change request");
        }

        if (shiftChangeRequest.getStatus() != ShiftChangeRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot approve a non-pending revert leave request");
        }

        shiftChangeRequest.setStatus(ShiftChangeRequestStatus.REJECTED_APPROVAL);
        shiftChangeRequestRepository.save(shiftChangeRequest);
    }

    @Override
    public void adminApproveShiftChangeRequest(Long id, ShiftChangeRequestHandleRequest handleRequest) {
        Employee employee = securityUtil.getCurrentUser();

        ShiftChangeRequest shiftChangeRequest = shiftChangeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift change request not found"));

        if (shiftChangeRequest.getStatus() != ShiftChangeRequestStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Cannot approve a non-pending revert leave request");
        }

        if ( !checkDateShiftChangeRequest(shiftChangeRequest) ){
            throw  new IllegalStateException("Cannot approve shift change request with past date or work shift that has already started");
        }

        if(!workShiftAssignmentRepository.existsByWorkShiftAndDateAssignAndEmployee(
                shiftChangeRequest.getWorkShift(), shiftChangeRequest.getDate(), shiftChangeRequest.getTargetEmployee())){
            throw new IllegalStateException("Target employee cannot have work shift required for this shift change request");
        }

        WorkShiftAssignment workShiftAssignment = workShiftAssignmentRepository.findByWorkShiftAndDateAssignAndEmployee(
                shiftChangeRequest.getWorkShift(), shiftChangeRequest.getDate(), shiftChangeRequest.getTargetEmployee())
                .orElseThrow(() -> new ResourceNotFoundException("Work shift assignment not found for target employee"));


        workShiftAssignmentService.deleteAssignment(shiftChangeRequest.getTargetEmployee().getId(),
                workShiftAssignment.getId());

        WorkShiftAssignmentRequest workShiftAssignmentRequest = WorkShiftAssignmentRequest.builder()
                .employeeId(shiftChangeRequest.getEmployee().getId())
                .workShiftId(shiftChangeRequest.getWorkShift().getId())
                .dateAssign(shiftChangeRequest.getDate())
                .build();

        WorkShiftAssignmentListRequest workShiftAssignmentListRequest = new WorkShiftAssignmentListRequest();
        workShiftAssignmentListRequest.setWorkShiftAssignments(List.of(workShiftAssignmentRequest));

        workShiftAssignmentService.addListAssignments(workShiftAssignmentListRequest);


        shiftChangeRequest.setResponseBy(employee);
        shiftChangeRequest.setResponseNote(handleRequest.getResponseNote());
        shiftChangeRequest.setStatus(ShiftChangeRequestStatus.APPROVED);
        shiftChangeRequest.setResponseDate(LocalDateTime.now());
        shiftChangeRequestRepository.save(shiftChangeRequest);

        notificationService.sendNotification(employee, "Đơn xin đổi ca của bạn ngày " + shiftChangeRequest.getDate() + " đã được phê duyệt");

        emailService.sendApprovalEmail(
                shiftChangeRequest.getEmployee().getEmail(),
                "Đơn xin đổi ca của bạn ngày " + shiftChangeRequest.getDate() + " đã được phê duyệt. " +
                        "Bạn sẽ làm việc theo ca mới từ " + shiftChangeRequest.getWorkShift().getStartTime() +
                        " đến " + shiftChangeRequest.getWorkShift().getEndTime(),
                true
        );

    }

    @Override
    public void adminRejectShiftChangeRequest(Long id, ShiftChangeRequestHandleRequest handleRequest) {
        Employee employee = securityUtil.getCurrentUser();

        ShiftChangeRequest shiftChangeRequest = shiftChangeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift change request not found"));

        if (shiftChangeRequest.getStatus() != ShiftChangeRequestStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Cannot approve a non-pending revert leave request");
        }

        shiftChangeRequest.setResponseBy(employee);
        shiftChangeRequest.setResponseDate(LocalDateTime.now());
        shiftChangeRequest.setResponseNote(handleRequest.getResponseNote());
        shiftChangeRequest.setStatus(ShiftChangeRequestStatus.REJECTED);
        shiftChangeRequestRepository.save(shiftChangeRequest);
        notificationService.sendNotification(employee, "Đơn xin đổi ca của bạn ngày " + shiftChangeRequest.getDate() + " đã bị từ chối");

        emailService.sendApprovalEmail(
                shiftChangeRequest.getEmployee().getEmail(),
                "Đơn xin đổi ca của bạn ngày " + shiftChangeRequest.getDate() + " đã bị từ chối. "
                        + (handleRequest.getResponseNote() != null && !handleRequest.getResponseNote().isBlank()
                        ? "Lý do: " + handleRequest.getResponseNote()
                        : ""),
                false
        );
    }

    @Override
    public ResponseWithPagination<List<ShiftChangeRequestResponse>> getShiftChangeRequestAdmin(int page, int size, String employeeName, LocalDate createdDate, LocalDate date, Long departmentId, Long workShiftId, String status) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<ShiftChangeRequest> revertLeaveRequestPage = shiftChangeRequestRepository.findAllWithFilters(
                employeeName, createdDate,date, departmentId, workShiftId,
                status != null ? ShiftChangeRequestStatus.valueOf(status.toUpperCase()) : null, pageable);

        List<ShiftChangeRequestResponse> shiftChangeRequestResponses = revertLeaveRequestPage.getContent().stream()
                .map(ShiftChangeRequestConverter::toResponse)
                .toList();

        return ResponseWithPagination.<List<ShiftChangeRequestResponse>>builder()
                .data(shiftChangeRequestResponses)
                .totalItem((int) revertLeaveRequestPage.getTotalElements())
                .totalPage(revertLeaveRequestPage.getTotalPages())
                .limit(size)
                .page(page)
                .build();
    }


}
