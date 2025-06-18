package com.attendance.fpt.services;

import com.attendance.fpt.model.request.RevertLeaveRequestAddRequest;
import com.attendance.fpt.model.request.RevertLeaveRequestHandleRequest;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.model.response.RevertLeaveRequestResponse;

import java.time.LocalDate;
import java.util.List;

public interface RevertLeaveRequestService {

    ResponseWithPagination<List<RevertLeaveRequestResponse>> getAllRevertLeaveRequests(int page, int size, String employeeName, LocalDate createdDate,LocalDate date, Long departmentId, Long workShiftId, String status);

    ResponseWithPagination<List<RevertLeaveRequestResponse>> getAllRevertLeaveRequestsByEmployee(int page, int size);

    RevertLeaveRequestResponse createRevertLeaveRequest(RevertLeaveRequestAddRequest revertLeaveRequestAddRequest);

    void recallRevertLeaveRequest(Long id);

    void approveRevertLeaveRequest( Long id, RevertLeaveRequestHandleRequest revertLeaveRequestHandleRequest);

    void rejectRevertLeaveRequest( Long id, RevertLeaveRequestHandleRequest revertLeaveRequestHandleRequest);

}
