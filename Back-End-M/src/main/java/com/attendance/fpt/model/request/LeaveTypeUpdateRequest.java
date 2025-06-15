package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaveTypeUpdateRequest {
    @NotBlank(message = "Name is required")
    private String name;
}
