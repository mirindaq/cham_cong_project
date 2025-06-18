package com.attendance.fpt.services;


import com.attendance.fpt.model.request.PartTimeRequestAddRequest;
import com.attendance.fpt.model.request.PartTimeRequestHandleRequest;
import com.attendance.fpt.model.response.PartTimeRequestResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;

public interface PartTimeRequestService {
    ResponseWithPagination<List<PartTimeRequestResponse>> getAllPartTimeRequests(int page, int size, String employeeName, LocalDate createdDate, LocalDate requestDate, Long departmentId,
                                                                                Long workShiftId, String status
    );

    ResponseWithPagination<List<PartTimeRequestResponse>> getAllPartTimeRequestsByEmployee(int page, int size);

    PartTimeRequestResponse createPartTimeRequest(@Valid PartTimeRequestAddRequest partTimeRequestAddRequest);

    void recallPartTimeRequest(Long id);


    void approvePartTimeRequest(Long id, PartTimeRequestHandleRequest partTimeRequestHandleRequest);

    void rejectPartTimeRequest(Long id, PartTimeRequestHandleRequest partTimeRequestHandleRequest);
}
