package com.attendance.fpt.services;

public interface EmailService {
    void sendNewPassword(String to, String newPassword);
}
