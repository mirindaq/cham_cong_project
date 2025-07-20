package com.attendance.fpt.services;

public interface EmailService {
    void sendOtp(String to, String otp);

    void sendApprovalEmail(String to, String message, boolean isApproved);

    void sendReminderEmail(String to, String message);
}
