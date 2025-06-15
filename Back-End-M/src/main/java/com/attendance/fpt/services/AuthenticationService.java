package com.attendance.fpt.services;

import com.attendance.fpt.model.request.ChangePasswordFirstLoginRequest;
import com.attendance.fpt.model.request.ChangePasswordRequest;
import com.attendance.fpt.model.request.ForgotPasswordRequest;
import com.attendance.fpt.model.request.LoginRequest;
import com.attendance.fpt.model.response.EmployeeResponse;
import com.attendance.fpt.model.response.LoginResponse;

public interface AuthenticationService {
    LoginResponse login(LoginRequest loginRequest);

    LoginResponse refreshToken(String refreshToken);

    void logout(String accessToken);

    void resetPassword(ForgotPasswordRequest forgotPasswordRequest);

    void changePassword(ChangePasswordRequest changePasswordRequest);

    EmployeeResponse changePasswordFirstLogin(ChangePasswordFirstLoginRequest changePasswordFirstLoginRequest);
} 