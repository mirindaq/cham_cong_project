package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.WorkShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface WorkShiftRepository extends JpaRepository<WorkShift, Long> {

    @Query("SELECT COUNT(*) > 0 FROM WorkShiftAssignment WHERE workShift.id = :workShiftId")
    boolean workShiftHaveAssignments(@Param("workShiftId") Long workShiftId);

    @Query("SELECT wsa.workShift FROM WorkShiftAssignment wsa" +
            " left join wsa.attendance a" +
            " WHERE wsa.employee.id = :employeeId" +
            " AND wsa.dateAssign BETWEEN :startDate AND :endDate" +
            " and a.id is null")
    List<WorkShift> findByEmployeeIdAndDateBetween(
        @Param("employeeId") Long employeeId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
} 