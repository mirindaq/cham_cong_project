package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {
    boolean existsByName(String name);
} 