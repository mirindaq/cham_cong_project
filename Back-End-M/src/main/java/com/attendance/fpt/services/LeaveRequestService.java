package com.attendance.fpt.services;

import com.attendance.fpt.model.request.LeaveRequestAddRequest;
import com.attendance.fpt.model.response.LeaveRequestResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;

import java.util.List;

public interface LeaveRequestService {
    LeaveRequestResponse createLeaveRequest(LeaveRequestAddRequest request);
    void recallLeaveRequest(Long id);
    void rejectLeaveRequest(Long id);
    ResponseWithPagination<List<LeaveRequestResponse>>getAllLeaveRequests(int page, int size);
} 