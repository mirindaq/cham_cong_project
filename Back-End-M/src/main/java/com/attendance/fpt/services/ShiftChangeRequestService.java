package com.attendance.fpt.services;

import com.attendance.fpt.model.request.ShiftChangeAddRequest;
import com.attendance.fpt.model.request.ShiftChangeRequestHandleRequest;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.model.response.ShiftChangeRequestResponse;

import java.time.LocalDate;
import java.util.List;

public interface ShiftChangeRequestService {
    ShiftChangeRequestResponse createShiftChangeRequest(ShiftChangeAddRequest shiftChangeAddRequest);

    ResponseWithPagination<List<ShiftChangeRequestResponse>> getAllSentShiftChangeRequests(int page, int size);

    ResponseWithPagination<List<ShiftChangeRequestResponse>> getAllReceivedShiftChangeRequests(int page, int size);

    void recallShiftChangeRequest(Long id);

    void employeeApproveShiftChangeRequest(Long id);

    void employeeRejectShiftChangeRequest(Long id);

    void adminApproveShiftChangeRequest(Long id, ShiftChangeRequestHandleRequest handleRequest);

    void adminRejectShiftChangeRequest(Long id, ShiftChangeRequestHandleRequest handleRequest);

    ResponseWithPagination<List<ShiftChangeRequestResponse>> getShiftChangeRequestAdmin(int page, int size, String employeeName, LocalDate createdDate, LocalDate date,
                                                                                        Long departmentId, Long workShiftId, String status);
}
