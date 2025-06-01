package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaveRequestHandleRequest {
    @NotBlank(message = "responseNote is required")
    private String responseNote;
    @NotNull(message = "responseById is required")
    private Long responseById;
}
