package com.attendance.fpt.services;

import com.attendance.fpt.model.request.LeaveRequestAddRequest;
import com.attendance.fpt.model.request.LeaveRequestHandleRequest;
import com.attendance.fpt.model.response.LeaveRequestResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestService {
    LeaveRequestResponse createLeaveRequest(LeaveRequestAddRequest request);
    void recallLeaveRequest(Long id);
    void rejectLeaveRequest(Long id, LeaveRequestHandleRequest leaveRequestHandleRequest);
    void approveLeaveRequest(Long id, LeaveRequestHandleRequest leaveRequestHandleRequest);
    ResponseWithPagination<List<LeaveRequestResponse>> getAllLeaveRequestsByEmployee(int page, int limit);
    List<LeaveRequestResponse> getPendingLeaveRequests();
    ResponseWithPagination<List<LeaveRequestResponse>> getAllLeaveRequests(
            int page,
            int limit,
            String employeeName,
            LocalDate startDate,
            LocalDate endDate,
            Long departmentId,
            Long workShiftId,
            Long leaveTypeId,
            String status);
}