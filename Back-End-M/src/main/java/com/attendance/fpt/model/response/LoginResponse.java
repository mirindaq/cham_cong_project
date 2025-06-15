package com.attendance.fpt.model.response;

import lombok.*;

@Getter
@Setter
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String username;
    private String role;
} 