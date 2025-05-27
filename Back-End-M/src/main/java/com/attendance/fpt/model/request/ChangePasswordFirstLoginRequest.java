package com.attendance.fpt.model.request;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ChangePasswordFirstLoginRequest {
    private String username;
    private String newPassword;
    private String confirmPassword;
}
