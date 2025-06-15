package com.attendance.fpt.services.impl;

import com.attendance.fpt.config.jwt.JwtUtil;
import com.attendance.fpt.converter.EmployeeConverter;
import com.attendance.fpt.converter.LoginResponseConverter;
import com.attendance.fpt.entity.Account;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.enums.TokenType;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.ChangePasswordFirstLoginRequest;
import com.attendance.fpt.model.request.ChangePasswordRequest;
import com.attendance.fpt.model.request.ForgotPasswordRequest;
import com.attendance.fpt.model.request.LoginRequest;
import com.attendance.fpt.model.response.EmployeeResponse;
import com.attendance.fpt.model.response.LoginResponse;
import com.attendance.fpt.repositories.AccountRepository;
import com.attendance.fpt.repositories.EmployeeRepository;
import com.attendance.fpt.services.AuthenticationService;
import com.attendance.fpt.services.EmailService;
import com.attendance.fpt.utils.PasswordGenerator;
import com.attendance.fpt.utils.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final EmployeeRepository employeeRepository;
    private final AccountRepository accountRepository;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final SecurityUtil securityUtil;
    private final PasswordEncoder passwordEncoder;

    @Override
    public LoginResponse login(LoginRequest loginRequest) {

        if (loginRequest.getUsername() == null || loginRequest.getPassword() == null) {
            throw new IllegalArgumentException("Username and password must not be null");
        }

        Account account = accountRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Username not found"));

        Employee employee = account.getEmployee();
        if (employee == null) {
            throw new ResourceNotFoundException("Employee not found for account");
        }

        if (!employee.isActive()) {
            throw new IllegalArgumentException("Account is locked");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), account.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        if (account.isFirstLogin()) {
            throw new IllegalArgumentException("First login, please change your password");
        }

        String token = jwtUtil.generateAccessToken(account);
        String refreshToken = jwtUtil.generateRefreshToken(account);

        account.setRefreshToken(refreshToken);
        accountRepository.save(account);
        return LoginResponseConverter.toResponse(token,refreshToken, account.getUsername(), account.getRole().name());
    }

    @Override
    @Transactional
    public void resetPassword(ForgotPasswordRequest forgotPasswordRequest) {
        Employee employee = employeeRepository.findByEmail(forgotPasswordRequest.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));

        if (!employee.isActive()) {
            throw new IllegalArgumentException("Account is locked");
        }

        Account account = employee.getAccount();
        if (account == null) {
            throw new IllegalArgumentException("Account not found for employee");
        }

        String newPassword = PasswordGenerator.generateRandomPassword();
        account.setPassword(passwordEncoder.encode(newPassword));
        accountRepository.save(account);

        emailService.sendNewPassword(forgotPasswordRequest.getEmail(), newPassword);
    }

    @Override
    public void changePassword(ChangePasswordRequest changePasswordRequest) {
        Employee employee = securityUtil.getCurrentUser();

        Account account = employee.getAccount();
        if (account == null) {
            throw new IllegalArgumentException("Account not found for employee");
        }

        if ( !passwordEncoder.matches(changePasswordRequest.getOldPassword(), account.getPassword()) ){
            throw new IllegalArgumentException("Old password is not correct");
        }

        if ( !changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmPassword())){
            throw new IllegalArgumentException("New password and confirm password is not map");
        }
        String passwordEncode = passwordEncoder.encode(changePasswordRequest.getNewPassword());
        account.setPassword(passwordEncode);
        accountRepository.save(account);
    }

    @Override
    public EmployeeResponse changePasswordFirstLogin(ChangePasswordFirstLoginRequest changePasswordFirstLoginRequest) {
        Employee employee = employeeRepository.findByEmail(changePasswordFirstLoginRequest.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        Account account = employee.getAccount();
        if (account == null) {
            throw new IllegalArgumentException("Account not found for employee");
        }

        if (!changePasswordFirstLoginRequest.getNewPassword().equals(changePasswordFirstLoginRequest.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        String passwordEncode = passwordEncoder.encode(changePasswordFirstLoginRequest.getNewPassword());
        account.setPassword(passwordEncode);
        account.setFirstLogin(false);
        accountRepository.save(account);
        return EmployeeConverter.toResponse(employee);
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        if (!jwtUtil.validateJwtToken(refreshToken, TokenType.REFRESH_TOKEN)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        String username = jwtUtil.getUserNameFromJwtToken(refreshToken, TokenType.REFRESH_TOKEN);

        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        // So sánh token gửi lên có trùng khớp token đã lưu
        if (!refreshToken.equals(account.getRefreshToken())) {
            throw new IllegalArgumentException("Refresh token does not match stored token");
        }

        String newAccessToken = jwtUtil.generateAccessToken(account);

        return LoginResponseConverter.toResponse(newAccessToken, refreshToken, username, account.getRole().name());
    }

    @Override
    public void logout(String accessToken) {
        if (!jwtUtil.validateJwtToken(accessToken, TokenType.ACCESS_TOKEN)) {
            throw new IllegalArgumentException("Invalid or expired access token");
        }

        String username = jwtUtil.getUserNameFromJwtToken(accessToken, TokenType.ACCESS_TOKEN);
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        account.setRefreshToken(null);
        accountRepository.save(account);
    }

} 