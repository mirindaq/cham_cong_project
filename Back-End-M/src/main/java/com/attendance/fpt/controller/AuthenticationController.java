package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.ChangePasswordFirstLoginRequest;
import com.attendance.fpt.model.request.ChangePasswordRequest;
import com.attendance.fpt.model.request.ForgotPasswordRequest;
import com.attendance.fpt.model.request.LoginRequest;
import com.attendance.fpt.model.response.EmployeeResponse;
import com.attendance.fpt.model.response.LoginResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.services.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/auth")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<ResponseSuccess<EmployeeResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Login Success",
                authenticationService.login(loginRequest)
        ));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ResponseSuccess<?>> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        authenticationService.changePassword(changePasswordRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Change password success",
                null
        ));
    }

    @PostMapping("/change-password-first-login")
    public ResponseEntity<ResponseSuccess<?>> changePasswordFirstLogin(@Valid @RequestBody ChangePasswordFirstLoginRequest changePasswordFirstLoginRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Change password first login success",
                authenticationService.changePasswordFirstLogin(changePasswordFirstLoginRequest)
        ));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseSuccess<?>> resetPassword(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        authenticationService.resetPassword(forgotPasswordRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Reset password success",
                null
        ));
    }
} 