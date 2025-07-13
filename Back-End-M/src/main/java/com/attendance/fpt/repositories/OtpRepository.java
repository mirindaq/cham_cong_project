package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp,Long> {

    Optional<Otp> findTopByAccount_UsernameOrderByCreatedAtDesc(String username);

    void deleteAllByExpiresAtBefore(LocalDateTime expiresAtBefore);
}
