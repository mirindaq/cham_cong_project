package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Complaints;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintsRepository extends JpaRepository<Complaints, Long> {
    
} 