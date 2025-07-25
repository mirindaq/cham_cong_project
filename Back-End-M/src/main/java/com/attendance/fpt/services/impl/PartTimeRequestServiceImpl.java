package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.PartTimeRequestConverter;
import com.attendance.fpt.entity.*;
import com.attendance.fpt.enums.EmployeeType;
import com.attendance.fpt.enums.LeaveRequestStatus;
import com.attendance.fpt.enums.PartTimeRequestStatus;
import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.PartTimeRequestAddRequest;
import com.attendance.fpt.model.request.PartTimeRequestHandleRequest;
import com.attendance.fpt.model.response.PartTimeRequestResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.repositories.*;
import com.attendance.fpt.services.EmailService;
import com.attendance.fpt.services.NotificationService;
import com.attendance.fpt.services.PartTimeRequestService;
import com.attendance.fpt.utils.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PartTimeRequestServiceImpl implements PartTimeRequestService {
    private final WorkShiftAssignmentRepository workShiftAssignmentRepository;
    private final WorkShiftRepository workShiftRepository;
    private final SecurityUtil securityUtil;
    private final PartTimeRequestRepository partTimeRequestRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    @Override
    public ResponseWithPagination<List<PartTimeRequestResponse>> getAllPartTimeRequests(
            int page,
            int size,
            String employeeName,
            LocalDate createdDate,
            LocalDate requestDate,
            Long departmentId,
            Long workShiftId,
            String status
    ) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<PartTimeRequest> partTimeRequestPage = partTimeRequestRepository.findAllWithFilters(
                employeeName,
                createdDate,
                requestDate,
                departmentId,
                workShiftId,
                status != null ? PartTimeRequestStatus.valueOf(status.toUpperCase()) : null,
                pageable
        );

        List<PartTimeRequestResponse> partTimeRequestResponses = partTimeRequestPage.getContent().stream()
                .map(PartTimeRequestConverter::toResponse)
                .toList();

        return ResponseWithPagination.<List<PartTimeRequestResponse>>builder()
                .data(partTimeRequestResponses)
                .totalItem((int) partTimeRequestPage.getTotalElements())
                .totalPage(partTimeRequestPage.getTotalPages())
                .limit(size)
                .page(page)
                .build();
    }



    @Override
    public ResponseWithPagination<List<PartTimeRequestResponse>> getAllPartTimeRequestsByEmployee(int page, int size) {
        Employee employee = securityUtil.getCurrentUser();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<PartTimeRequest> partTimeRequests = partTimeRequestRepository.findAllByEmployee_Id(employee.getId(), pageable);
        Page<PartTimeRequestResponse> responsePage = partTimeRequests.map(PartTimeRequestConverter::toResponse);

        return ResponseWithPagination.<List<PartTimeRequestResponse>>builder()
                .data(responsePage.getContent())
                .totalItem((int) responsePage.getTotalElements())
                .totalPage(responsePage.getTotalPages())
                .limit(size)
                .page(page)
                .build();
    }

    @Override
    public PartTimeRequestResponse createPartTimeRequest(PartTimeRequestAddRequest partTimeRequestAddRequest) {
        Employee employee = securityUtil.getCurrentUser();

        if ( employee.getEmployeeType() != EmployeeType.PART_TIME) {
            throw new ConflictException("Only part-time employees can create part-time requests");
        }

        WorkShift workShift = workShiftRepository.findById(partTimeRequestAddRequest.getWorkShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Work shift not found"));

        if (partTimeRequestAddRequest.getDate().isBefore(LocalDate.now())) {
            throw new ConflictException("Cannot create part-time request for past date");
        }

        if ( partTimeRequestAddRequest.getDate().equals(LocalDate.now()) && workShift.getStartTime().isBefore(LocalTime.now())){
            throw new ConflictException("Cannot create part-time request for work shift that has already started");
        }


        PartTimeRequest partTimeRequest = PartTimeRequest.builder()
                .date(partTimeRequestAddRequest.getDate())
                .workShift(workShift)
                .employee(employee)
                .status(PartTimeRequestStatus.PENDING)
                .build();

        return PartTimeRequestConverter.toResponse( partTimeRequestRepository.save(partTimeRequest));
    }

    @Override
    public void recallPartTimeRequest(Long id) {
        Employee employee = securityUtil.getCurrentUser();

        PartTimeRequest partTimeRequest = partTimeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part-time request not found"));

        if (!partTimeRequest.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalStateException("You can only recall your own requests");
        }

        if (partTimeRequest.getStatus() != PartTimeRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot recall a non-pending request");
        }

        partTimeRequest.setStatus(PartTimeRequestStatus.RECALLED);
        partTimeRequestRepository.save(partTimeRequest);
    }

    @Override
    public void approvePartTimeRequest(Long id, PartTimeRequestHandleRequest partTimeRequestHandleRequest) {
        Employee employee = securityUtil.getCurrentUser();

        PartTimeRequest partTimeRequest = partTimeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part-time request not found"));

        if (partTimeRequest.getStatus() != PartTimeRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot recall a non-pending request");
        }


        if ( partTimeRequest.getDate().isBefore(LocalDate.now()) ||
                (partTimeRequest.getDate().isEqual(LocalDate.now()) &&
                        partTimeRequest.getWorkShift().getStartTime().isBefore(LocalTime.now()))) {
            throw new ConflictException("Cannot approve part time request for past time.");
        }

        if (!workShiftAssignmentRepository.existsOverlappingAssignments(employee.getId(), partTimeRequest.getDate(),
                partTimeRequest.getWorkShift().getStartTime(), partTimeRequest.getWorkShift().getEndTime()).isEmpty()) {
            throw new ConflictException("Work shift assignment overlapping for this date and time");
        }

        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .dateAssign(partTimeRequest.getDate())
                .workShift(partTimeRequest.getWorkShift())
                .employee(partTimeRequest.getEmployee())
                .build();
        workShiftAssignmentRepository.save(assignment);

        partTimeRequest.setResponseDate(LocalDateTime.now());
        partTimeRequest.setResponseBy(employee);
        partTimeRequest.setResponseNote(partTimeRequestHandleRequest.getResponseNote());
        partTimeRequest.setStatus(PartTimeRequestStatus.APPROVED);
        partTimeRequestRepository.save(partTimeRequest);

        notificationService.sendNotification(partTimeRequest.getEmployee(), "Đơn xin làm thêm giờ của bạn ngày " + partTimeRequest.getDate() + " đã được phê duyệt");

        String message = "Đơn xin làm thêm giờ vào ngày " + partTimeRequest.getDate() + " của bạn đã được phê duyệt."
                + "Bạn sẽ làm việc theo ca từ "
                + partTimeRequest.getWorkShift().getStartTime()
                + " đến " + partTimeRequest.getWorkShift().getEndTime() + ".";

        if (partTimeRequestHandleRequest.getResponseNote() != null && !partTimeRequestHandleRequest.getResponseNote().isBlank()) {
            message += " Ghi chú từ quản lý: " + partTimeRequestHandleRequest.getResponseNote();
        }

        emailService.sendApprovalEmail(
                partTimeRequest.getEmployee().getEmail(),
                message,
                true
        );

    }

    @Override
    public void rejectPartTimeRequest(Long id, PartTimeRequestHandleRequest partTimeRequestHandleRequest) {
        Employee employee = securityUtil.getCurrentUser();

        PartTimeRequest partTimeRequest = partTimeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part-time request not found"));

        if (partTimeRequest.getStatus() != PartTimeRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot recall a non-pending request");
        }

        partTimeRequest.setResponseDate(LocalDateTime.now());
        partTimeRequest.setResponseBy(employee);
        partTimeRequest.setResponseNote(partTimeRequestHandleRequest.getResponseNote());
        partTimeRequest.setStatus(PartTimeRequestStatus.REJECTED);
        partTimeRequestRepository.save(partTimeRequest);

        notificationService.sendNotification(partTimeRequest.getEmployee(), "Đơn xin làm thêm giờ của bạn ngày " + partTimeRequest.getDate() + " đã bị từ chối");

        String message = "Đơn xin làm thêm giờ vào ngày " + partTimeRequest.getDate() + " của bạn đã bị từ chối.";

        if (partTimeRequestHandleRequest.getResponseNote() != null && !partTimeRequestHandleRequest.getResponseNote().isBlank()) {
            message += " Lý do: " + partTimeRequestHandleRequest.getResponseNote();
        }

        emailService.sendApprovalEmail(
                partTimeRequest.getEmployee().getEmail(),
                message,
                false
        );

    }
}
