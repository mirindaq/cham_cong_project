package com.attendance.fpt.utils;

import com.attendance.fpt.entity.Account;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.repositories.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtil {
    private final AccountRepository accountRepository;

    public Employee getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails) {
            Account account = accountRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found with username: " + userDetails.getUsername()));
            return account.getEmployee();
        }
        throw new AccessDeniedException("Access denied. You don't have the required role.");
    }
}
