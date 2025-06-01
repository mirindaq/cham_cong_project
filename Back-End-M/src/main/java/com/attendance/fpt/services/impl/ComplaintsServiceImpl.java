package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.ComplaintsConverter;
import com.attendance.fpt.entity.Complaint;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.enums.ComplaintStatus;
import com.attendance.fpt.enums.ComplaintType;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.ComplaintAddRequest;
import com.attendance.fpt.model.response.ComplaintResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.repositories.ComplaintsRepository;
import com.attendance.fpt.repositories.EmployeeRepository;
import com.attendance.fpt.services.ComplaintsService;
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
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public ComplaintResponse createComplaint(ComplaintAddRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        Complaint complaint = Complaint.builder()
                .reason(request.getReason())
                .date(LocalDate.now())
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
        Complaint complaint = complaintsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (complaint.getStatus() != ComplaintStatus.PENDING) {
            throw new IllegalStateException("Cannot recall a non-pending complaint");
        }

        complaint.setStatus(ComplaintStatus.RECALLED);
        complaintsRepository.save(complaint);
    }

    @Override
    public ResponseWithPagination<List<ComplaintResponse>> getAllComplaintsByEmployeeId(int page, int limit, Long employeeId) {
        Pageable pageable = PageRequest.of(page-1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Complaint> complaints = complaintsRepository.findAllByEmployee_Id(employeeId, pageable);

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
            LocalDate startDate,
            LocalDate endDate,
            Long departmentId,
            String complaintType,
            String status) {

        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;

        Page<Complaint> complaints = complaintsRepository.findAllWithFilters(
                employeeName,
                startDateTime,
                endDateTime,
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

}