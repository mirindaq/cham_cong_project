package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.OtpRequest;
import com.attendance.fpt.model.request.ResetPasswordWithOtpRequest;
import com.attendance.fpt.model.request.VerifyOtpRequest;
import com.attendance.fpt.model.response.OtpResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.services.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/otp")
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/send")
    public ResponseEntity<ResponseSuccess<?>> sendOtp(@Valid @RequestBody OtpRequest request) {
        otpService.sendOtp(request.getEmail());
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Send OTP success",
                null
        ));
    }

    @PostMapping("/verify")
    public ResponseEntity<ResponseSuccess<OtpResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(
                new ResponseSuccess<>(
                        HttpStatus.OK,
                        "Verify OTP success",
                        otpService.verifyOtp(request.getEmail(), request.getOtpCode())
                )
        );
    }


    @PostMapping("/reset-password")
    public ResponseEntity<ResponseSuccess<?>> resetPasswordWithOtp(@Valid @RequestBody ResetPasswordWithOtpRequest request) {
        otpService.resetPasswordWithOtp(request);
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Reset password with OTP success",
                null
        ));
    }
}
