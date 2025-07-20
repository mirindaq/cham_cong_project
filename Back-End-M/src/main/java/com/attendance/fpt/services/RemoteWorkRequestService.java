package com.attendance.fpt.services;

import com.attendance.fpt.model.request.RemoteWorkRequestAddRequest;
import com.attendance.fpt.model.request.RemoteWorkRequestHandleRequest;
import com.attendance.fpt.model.response.RemoteWorkRequestResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;

public interface RemoteWorkRequestService {
    ResponseWithPagination<List<RemoteWorkRequestResponse>> getAllRemoteWorkRequests(int page, int size, String employeeName,
                                                                                     LocalDate createdDate, LocalDate date,
                                                                                     Long departmentId,Long workShiftId, String status);

    ResponseWithPagination<List<RemoteWorkRequestResponse>> getAllRemoteWorkRequestsByEmployee(int page, int size);

    RemoteWorkRequestResponse createRemoteWorkRequest(@Valid RemoteWorkRequestAddRequest request);

    void recallRemoteWorkRequest(Long id);

    void approveRemoteWorkRequest(Long id, RemoteWorkRequestHandleRequest handleRequest);

    void rejectRemoteWorkRequest(Long id, RemoteWorkRequestHandleRequest handleRequest);
}
