package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.*;
import com.attendance.fpt.model.response.LoginResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.services.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public ResponseEntity<ResponseSuccess<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Login Success",
                authenticationService.login(loginRequest)
        ));
    }

    @PostMapping("/change-password")
    @PreAuthorize("hasAnyRole('ROLE_EMPLOYEE', 'ROLE_ADMIN')")
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


    @PostMapping("/refresh-token")
    public ResponseEntity<ResponseSuccess<LoginResponse>> refresh(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Login Success",
                authenticationService.refreshToken(refreshTokenRequest.getRefreshToken())
        ));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResponseSuccess<?>> logout(HttpServletRequest request) {
        authenticationService.logout(request);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Logout Success",
               null));
    }


} 