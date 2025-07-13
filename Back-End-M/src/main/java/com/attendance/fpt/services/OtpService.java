package com.attendance.fpt.services;

import com.attendance.fpt.model.request.ResetPasswordWithOtpRequest;
import com.attendance.fpt.model.response.OtpResponse;

public interface OtpService {
    void sendOtp(String email);

    OtpResponse verifyOtp(String email, String otpCode);

    void resetPasswordWithOtp(ResetPasswordWithOtpRequest resetPasswordWithOtpRequest);
}
