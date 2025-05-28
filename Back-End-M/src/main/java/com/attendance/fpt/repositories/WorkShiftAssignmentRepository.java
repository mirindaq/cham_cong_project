package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.entity.WorkShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface WorkShiftAssignmentRepository extends JpaRepository<WorkShiftAssignment, Long> {

    @Query("SELECT wsa FROM WorkShiftAssignment wsa " +
            "WHERE wsa.employee.id = :employeeId " +
            "AND wsa.dateAssign = :dateAssign " +
            "AND (wsa.workShift.startTime < :endTime AND wsa.workShift.endTime > :startTime)")
    List<WorkShiftAssignment> existsOverlappingAssignments(@Param("employeeId") Long employeeId,
                                                           @Param("dateAssign") LocalDate dateAssign,
                                                           @Param("startTime") LocalTime startTime,
                                                           @Param("endTime") LocalTime endTime);


    @Query("SELECT w FROM WorkShiftAssignment w" +
            " WHERE w.employee.id = :employeeId" +
            " AND month(w.dateAssign) = :month AND year(w.dateAssign) = :year")
    List<WorkShiftAssignment> findAllByEmployeeAndMonthAndYear(@Param("employeeId") Long employeeId,
                                                               @Param("month") Long month,
                                                               @Param("year") Long year);


    @Query("SELECT w FROM WorkShiftAssignment w " +
            "WHERE w.employee.id = :employeeId " +
            "AND w.dateAssign = :dateAssign " +
            "AND :currentTime >= w.workShift.startTime " +
            "AND :currentTime <= w.workShift.endTime")
    Optional<WorkShiftAssignment> findCurrentShiftAssignment(@Param("employeeId") Long employeeId,
                                        @Param("dateAssign") LocalDate dateAssign,
                                        @Param("currentTime") LocalTime currentTime);



    @Query("SELECT wa FROM WorkShiftAssignment wa " +
            "JOIN wa.employee e " +
            "JOIN wa.workShift ws " +
            "WHERE (:employeeId IS NULL OR e.id = :employeeId) " +
            "AND (:workShiftId IS NULL OR ws.id = :workShiftId) " +
            "AND (:departmentId IS NULL OR e.department.id = :departmentId) " +
            "AND EXTRACT(MONTH FROM wa.dateAssign) = :month " +
            "AND EXTRACT(YEAR FROM wa.dateAssign) = :year")
    List<WorkShiftAssignment> filterAssignments(
            @Param("employeeId") Long employeeId,
            @Param("workShiftId") Long workShiftId,
            @Param("month") Long month,
            @Param("year") Long year,
            @Param("departmentId") Long departmentId
    );
} 