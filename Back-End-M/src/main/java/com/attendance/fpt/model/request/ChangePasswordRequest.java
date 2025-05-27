package com.attendance.fpt.model.request;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ChangePasswordRequest {
    private Long employeeId;
    private String oldPassword;
    private String newPassword;
    private String confirmPassword;
}
