package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.ComplaintsConverter;
import com.attendance.fpt.entity.Complaint;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.enums.ComplaintStatus;
import com.attendance.fpt.enums.ComplaintType;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.ComplaintAddRequest;
import com.attendance.fpt.model.request.ComplaintHandleRequest;
import com.attendance.fpt.model.response.ComplaintResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.repositories.ComplaintsRepository;
import com.attendance.fpt.repositories.EmployeeRepository;
import com.attendance.fpt.services.ComplaintsService;
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
public class ComplaintsServiceImpl implements ComplaintsService {

    private final ComplaintsRepository complaintsRepository;
    private final SecurityUtil securityUtil;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public ComplaintResponse createComplaint(ComplaintAddRequest request) {
        Employee employee = securityUtil.getCurrentUser();

        Complaint complaint = Complaint.builder()
                .reason(request.getReason())
                .date(request.getDate())
                .complaintType(ComplaintType.valueOf(request.getComplaintType()))
                .requestChange(request.getRequestChange())
                .employee(employee)
                .status(ComplaintStatus.PENDING)
                .build();

        return ComplaintsConverter.toResponse(complaintsRepository.save(complaint));
    }

    @Override
    @Transactional
    public void recallComplaint(Long id) {
        Employee employee = securityUtil.getCurrentUser();

        Complaint complaint = complaintsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (!complaint.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("You can only recall your own complaints");
        }

        if (complaint.getStatus() != ComplaintStatus.PENDING) {
            throw new IllegalStateException("Cannot recall a non-pending complaint");
        }

        complaint.setStatus(ComplaintStatus.RECALLED);
        complaintsRepository.save(complaint);
    }

    @Override
    public ResponseWithPagination<List<ComplaintResponse>> getAllComplaintsByEmployeeId(int page, int limit) {
        Employee employee = securityUtil.getCurrentUser();
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Complaint> complaints = complaintsRepository.findAllByEmployee_Id(employee.getId(), pageable);

        Page<ComplaintResponse> responsePage = complaints.map(ComplaintsConverter::toResponse);

        return ResponseWithPagination.<List<ComplaintResponse>>builder()
                .data(responsePage.getContent())
                .totalItem((int) responsePage.getTotalElements())
                .totalPage(responsePage.getTotalPages())
                .limit(limit)
                .page(page)
                .build();
    }

    @Override
    public ResponseWithPagination<List<ComplaintResponse>> getAllComplaints(
            int page,
            int limit,
            String employeeName,
            LocalDate createdDate,
            LocalDate date,
            Long departmentId,
            String complaintType,
            String status) {

        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));


        Page<Complaint> complaints = complaintsRepository.findAllWithFilters(
                employeeName,
                createdDate,
                date,
                departmentId,
                complaintType != null ? ComplaintType.valueOf(complaintType.toUpperCase()) : null,
                status != null ? ComplaintStatus.valueOf(status.toUpperCase()) : null,
                pageable);


        Page<ComplaintResponse> responsePage = complaints.map(ComplaintsConverter::toResponse);

        return ResponseWithPagination.<List<ComplaintResponse>>builder()
                .data(responsePage.getContent())
                .totalItem((int) responsePage.getTotalElements())
                .totalPage(responsePage.getTotalPages())
                .limit(limit)
                .page(page)
                .build();
    }

    @Override
    public List<ComplaintResponse> getPendingComplaints() {
        return complaintsRepository.findByStatusOrderByCreatedAtAsc(ComplaintStatus.PENDING)
                .stream()
                .map(ComplaintsConverter::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void approveComplaint(Long id, ComplaintHandleRequest complaintHandleRequest) {
        Employee employee = securityUtil.getCurrentUser();

        Complaint complaint = complaintsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (complaint.getStatus() != ComplaintStatus.PENDING) {
            throw new IllegalStateException("Cannot approve a non-pending complaint");
        }

        complaint.setStatus(ComplaintStatus.APPROVED);
        complaint.setResponseNote(complaintHandleRequest.getResponseNote());
        complaint.setResponseDate(LocalDateTime.now());
        complaint.setResponseBy(employee);
        complaintsRepository.save(complaint);

        notificationService.sendNotification(employee, "Đơn khiếu nại chấm công của bạn ngày " + complaint.getDate() + " đã được phê duyệt");
        
    }

    @Override
    public void rejectComplaint(Long id, ComplaintHandleRequest complaintHandleRequest) {
        Employee employee = securityUtil.getCurrentUser();

        Complaint complaint = complaintsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (complaint.getStatus() != ComplaintStatus.PENDING) {
            throw new IllegalStateException("Cannot reject a non-pending complaint");
        }

        complaint.setStatus(ComplaintStatus.REJECTED);
        complaint.setResponseNote(complaintHandleRequest.getResponseNote());
        complaint.setResponseDate(LocalDateTime.now());
        complaint.setResponseBy(employee);

        complaintsRepository.save(complaint);
        notificationService.sendNotification(employee, "Đơn khiếu nại chấm công của bạn ngày " + complaint.getDate() + " đã bị từ chối");
    }

}