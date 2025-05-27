package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    @Query("SELECT a FROM Attendance a " +
            " JOIN a.workShiftAssignment ws" +
            " WHERE a.employee.id = :employeeId " +
            "AND month(ws.dateAssign) = :month AND year(ws.dateAssign) = :year")
    List<Attendance> findAllByEmployeeAndMonthAndYear(Long employeeId, Long month, Long year);

    Optional<Attendance> findByIdAndEmployee_Id(Long id, Long employeeId);
}
