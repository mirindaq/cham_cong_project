package com.attendance.fpt.services.impl;

import com.attendance.fpt.entity.Account;
import com.attendance.fpt.entity.Otp;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.ResetPasswordWithOtpRequest;
import com.attendance.fpt.model.response.OtpResponse;
import com.attendance.fpt.repositories.AccountRepository;
import com.attendance.fpt.repositories.OtpRepository;
import com.attendance.fpt.services.EmailService;
import com.attendance.fpt.services.OtpService;
import com.attendance.fpt.utils.GenerateOTP;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Service
public class OtpServiceImpl implements OtpService {
    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void sendOtp(String email) {
        String otpCode = GenerateOTP.generateOTP();
        Account account = accountRepository.findByUsername(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with email: " + email));
        Otp otp = Otp.builder()
                .account(account)
                .otpCode(otpCode)
                .build();
        otpRepository.save(otp);

        emailService.sendOtp(email, otpCode);
    }

    @Override
    public OtpResponse verifyOtp(String email, String otpCode) {
        Otp otp = otpRepository.findTopByAccount_UsernameOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new ResourceNotFoundException("OTP not found for email: " + email));

        boolean isExpired = otp.getExpiresAt().isBefore(LocalDateTime.now());
        boolean isCorrectCode = otp.getOtpCode().equals(otpCode);

        return OtpResponse.builder()
                .isValid(!isExpired && isCorrectCode)
                .build();
    }

    @Override
    @Transactional
    public void resetPasswordWithOtp(ResetPasswordWithOtpRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Confirm password does not match new password");
        }

        Otp otp = otpRepository.findTopByAccount_UsernameOrderByCreatedAtDesc(request.getEmail())
                .orElseThrow(() ->new ResourceNotFoundException("OTP not found for email: " + request.getEmail()));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otp);
            throw new IllegalArgumentException("OTP expired");
        }

        if (!otp.getOtpCode().equals(request.getOtpCode())) {
            throw new IllegalArgumentException("OTP code is incorrect");
        }

        Account account = accountRepository.findByUsername(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with email: " + request.getEmail()));


        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        account.setPassword(encodedPassword);
        accountRepository.save(account);

        otpRepository.delete(otp);
    }


}
