package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.EmployeeConverter;
import com.attendance.fpt.entity.Account;
import com.attendance.fpt.entity.Employee;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final EmployeeRepository employeeRepository;
    private final AccountRepository accountRepository;
    private final EmailService emailService;

    @Override
    public EmployeeResponse login(LoginRequest loginRequest) {

        if (loginRequest.getUsername() == null || loginRequest.getPassword() == null) {
            throw new IllegalArgumentException("Username and password must not be null");
        }

        Employee employee = employeeRepository.findByUsernameAndPassword(loginRequest.getUsername(), loginRequest.getPassword());
        if (employee == null) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        if (!employee.isActive()) {
            throw new IllegalArgumentException("Account is locked");
        }

        if ( employee.getAccount().isFirstLogin()) {
            throw new IllegalArgumentException("First login, please change your password");
        }

        return EmployeeConverter.toResponse(employee);
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
        account.setPassword(newPassword);
        accountRepository.save(account);

        emailService.sendNewPassword(forgotPasswordRequest.getEmail(), newPassword);
    }

    @Override
    public void changePassword(ChangePasswordRequest changePasswordRequest) {
        Employee employee = employeeRepository.findById(changePasswordRequest.getEmployeeId())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        Account account = employee.getAccount();
        if (account == null) {
            throw new IllegalArgumentException("Account not found for employee");
        }
        if (!account.getPassword().equals(changePasswordRequest.getOldPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        if ( !changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        account.setPassword(changePasswordRequest.getNewPassword());
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

        if ( !changePasswordFirstLoginRequest.getNewPassword().equals(changePasswordFirstLoginRequest.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        account.setPassword(changePasswordFirstLoginRequest.getNewPassword());
        account.setFirstLogin(false);
        accountRepository.save(account);
        return EmployeeConverter.toResponse(employee);
    }
} 