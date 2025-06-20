package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account,Long> {
    Optional<Account> findByUsername(String username);
}
