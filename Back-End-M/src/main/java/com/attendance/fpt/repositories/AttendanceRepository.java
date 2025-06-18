package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Attendance;
import com.attendance.fpt.enums.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    @Query("SELECT a FROM Attendance a " +
            " JOIN a.workShiftAssignment ws" +
            " WHERE a.employee.id = :employeeId " +
            "AND month(ws.dateAssign) = :month AND year(ws.dateAssign) = :year")
    List<Attendance> findAllByEmployeeAndMonthAndYear(@Param("employeeId") Long employeeId,
                                                      @Param("month") Long month,
                                                      @Param("year") Long year);

    Optional<Attendance> findByIdAndEmployee_Id(Long id, Long employeeId);

    @Query("SELECT a FROM Attendance a " +
           "WHERE a.checkInTime IS NOT NULL OR a.checkOutTime IS NOT NULL " +
           "ORDER BY COALESCE(a.checkOutTime, a.checkInTime) DESC " +
           "LIMIT 3")
    List<Attendance> findRecentCheckers();


    @Query("SELECT COUNT(a) FROM Attendance a " +
              "WHERE  a.workShiftAssignment.dateAssign = :date" +
            " AND a.status = :status")
    long countByDateAndStatus(@Param("date") LocalDate date,  @Param("status") AttendanceStatus status);

    @Query(" select  a from Attendance a " +
            "where a.workShiftAssignment.dateAssign = :workShiftAssignmentDateAssign " +
            "and a.workShiftAssignment.workShift.id = :workShiftId " +
            "and a.status = :status")
    Optional<Attendance> findByAttendanceLeaveByDateAndWorkShiftIdAndStatus(
            @Param("workShiftAssignmentDateAssign") LocalDate workShiftAssignmentDateAssign,
            @Param("workShiftId") Long workShiftId,
            @Param("status") AttendanceStatus status);
}
