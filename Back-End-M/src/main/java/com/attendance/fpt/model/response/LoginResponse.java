package com.attendance.fpt.model.response;

import lombok.*;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private String username;
    private String role;
} 