package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.WorkShift;
import com.attendance.fpt.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;

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

    @Query("SELECT wsa.workShift FROM WorkShiftAssignment wsa" +
            " join wsa.attendance a" +
            " WHERE wsa.employee.id = :employeeId" +
            " AND wsa.dateAssign = :date " +
            " AND a.status = :status " +
            " AND ( :date > CURRENT_DATE OR " +
            " (:date = CURRENT_DATE AND wsa.workShift.startTime > CURRENT_TIME))")
    List<WorkShift> findByEmployeeIdAndDateAndAttendanceStatus(@Param("employeeId") Long employeeId,
                                                               @Param("date") LocalDate date,
                                                               @Param("status") AttendanceStatus status);


    @Query( "select ws from  WorkShift ws" +
            " where ws.active = :active " +
            " and ws.isPartTime = :partTime")
    List<WorkShift> findAllByPartTimeAndActive(@Param("partTime") boolean partTime, @Param("active") boolean active);

    List<WorkShift> findAllByActive(boolean active);

    @Query("SELECT ws FROM WorkShift ws WHERE ws.isPartTime = :partTime")
    List<WorkShift> findAllByPartTime(@Param("partTime") boolean partTime);
} 