package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
