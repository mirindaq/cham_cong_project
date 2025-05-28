package com.attendance.fpt.services;

import com.attendance.fpt.model.request.ComplaintAddRequest;
import com.attendance.fpt.model.response.ComplaintResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;

import java.util.List;

public interface ComplaintsService {

    ResponseWithPagination<List<ComplaintResponse>> getAllComplaints(int page, int limit
    );

    ResponseWithPagination<List<ComplaintResponse>> getAllComplaintsByEmployeeId(int page, int limit, Long employeeId
    );

    ComplaintResponse createComplaint(ComplaintAddRequest leaveRequestAddRequest);

    void recallComplaint(Long id);

    List<ComplaintResponse> getPendingComplaints();
}