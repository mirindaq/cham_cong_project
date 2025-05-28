package com.attendance.fpt.services;

import com.attendance.fpt.model.request.WorkShiftAssignmentListRequest;
import com.attendance.fpt.model.request.WorkShiftAssignmentRequest;
import com.attendance.fpt.model.response.WorkShiftAssignmentResponse;

import java.util.List;

public interface WorkShiftAssignmentService {
    List<WorkShiftAssignmentResponse> getAllAssignments( Long employeeId, Long workShiftId, Long month, Long year, Long departmentId);
    List<WorkShiftAssignmentResponse> addListAssignments(WorkShiftAssignmentListRequest request);

    void deleteAssignment(Long employeeId, Long workShiftAssignmentId);

} 