package com.attendance.fpt.converter;

import com.attendance.fpt.model.response.LoginResponse;

public class LoginResponseConverter {

    public static LoginResponse toResponse(String token, String refreshToken, String username, String role) {
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setAccessToken(token);
        loginResponse.setUsername(username);
        loginResponse.setRole(role);
        loginResponse.setRefreshToken(refreshToken);
        return loginResponse;
    }
}
