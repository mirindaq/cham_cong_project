package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.WorkShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkShiftRepository extends JpaRepository<WorkShift, Long> {

    @Query("SELECT COUNT(*) > 0 FROM WorkShiftAssignment WHERE workShift.id = :workShiftId")
    boolean workShiftHaveAssignments(@Param("workShiftId") Long workShiftId);
} 