package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    
} 