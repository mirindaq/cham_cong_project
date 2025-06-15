package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaveRequestHandleRequest {
    @NotBlank(message = "responseNote is required")
    private String responseNote;
}
