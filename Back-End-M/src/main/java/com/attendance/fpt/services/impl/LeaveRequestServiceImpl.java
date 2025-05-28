package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.LeaveRequestConverter;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.entity.LeaveRequest;
import com.attendance.fpt.entity.LeaveType;
import com.attendance.fpt.enums.LeaveRequestStatus;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.LeaveRequestAddRequest;
import com.attendance.fpt.model.response.EmployeeResponse;
import com.attendance.fpt.model.response.LeaveRequestResponse;
import com.attendance.fpt.model.response.LeaveTypeResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.repositories.EmployeeRepository;
import com.attendance.fpt.repositories.LeaveRequestRepository;
import com.attendance.fpt.repositories.LeaveTypeRepository;
import com.attendance.fpt.services.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveTypeRepository leaveTypeRepository;

    @Override
    @Transactional
    public LeaveRequestResponse createLeaveRequest(LeaveRequestAddRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        LeaveType leaveType = leaveTypeRepository.findById(request.getLeaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Leave type not found"));

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .employee(employee)
                .leaveType(leaveType)
                .status(LeaveRequestStatus.PENDING)
                .build();

        return LeaveRequestConverter.toResponse(leaveRequestRepository.save(leaveRequest));
    }

    @Override
    @Transactional
    public void recallLeaveRequest(Long id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (leaveRequest.getStatus() != LeaveRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot recall a non-pending leave request");
        }

        leaveRequest.setStatus(LeaveRequestStatus.RECALLED);
        leaveRequestRepository.save(leaveRequest);
    }

    @Override
    @Transactional
    public void rejectLeaveRequest(Long id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (leaveRequest.getStatus() != LeaveRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot reject a non-pending leave request");
        }

        leaveRequest.setStatus(LeaveRequestStatus.REJECTED);
        leaveRequest.setResponseDate(LocalDateTime.now());
        leaveRequestRepository.save(leaveRequest);
    }

    @Override
    public ResponseWithPagination<List<LeaveRequestResponse>> getAllLeaveRequests(int page, int limit) {
        Pageable pageable = PageRequest.of(page-1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<LeaveRequest> leaveRequests = leaveRequestRepository.findAll(pageable);

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
    public ResponseWithPagination<List<LeaveRequestResponse>> getAllLeaveRequestsByEmployee(int page, int limit, Long employeeId) {
        Pageable pageable = PageRequest.of(page-1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<LeaveRequest> leaveRequests = leaveRequestRepository.findAllByEmployee_Id(employeeId,pageable);

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

} 