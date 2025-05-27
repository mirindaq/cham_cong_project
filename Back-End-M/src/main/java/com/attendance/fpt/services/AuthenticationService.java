package com.attendance.fpt.services;

import com.attendance.fpt.model.request.ChangePasswordFirstLoginRequest;
import com.attendance.fpt.model.request.ChangePasswordRequest;
import com.attendance.fpt.model.request.ForgotPasswordRequest;
import com.attendance.fpt.model.request.LoginRequest;
import com.attendance.fpt.model.response.EmployeeResponse;
import com.attendance.fpt.model.response.LoginResponse;

public interface AuthenticationService {
    EmployeeResponse login(LoginRequest loginRequest);

    void resetPassword(ForgotPasswordRequest forgotPasswordRequest);

    void changePassword(ChangePasswordRequest changePasswordRequest);

    EmployeeResponse changePasswordFirstLogin(ChangePasswordFirstLoginRequest changePasswordFirstLoginRequest);
} 