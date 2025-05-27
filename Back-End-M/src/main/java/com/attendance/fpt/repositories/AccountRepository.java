package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account,Long> {
}
