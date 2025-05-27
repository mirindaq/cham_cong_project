package com.attendance.fpt.model.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class WorkShiftAssignmentListRequest {
    List<WorkShiftAssignmentRequest> workShiftAssignments;
}
