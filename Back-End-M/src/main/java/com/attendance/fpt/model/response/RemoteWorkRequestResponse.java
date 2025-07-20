package com.attendance.fpt.model.response;

import com.attendance.fpt.enums.RemoteWorkRequestStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class RemoteWorkRequestResponse {

    private Long id;
    private LocalDate date;
    private String reason;

    private String employeeName;
    private String departmentName;

    private LocalDateTime responseDate;
    private String responseBy;
    private String responseNote;

    private RemoteWorkRequestStatus status;
    private WorkShiftResponse workShift;
    private LocalDateTime createdAt;
}
