package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Attendance;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.entity.WorkShiftAssignment;
import com.attendance.fpt.enums.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
            "AND EXTRACT(YEAR FROM wa.dateAssign) = :year " +
            "AND wa.dateAssign IS NOT NULL " +
            "AND ws.startTime IS NOT NULL " +
            "ORDER BY wa.dateAssign ASC, ws.startTime ASC")
    List<WorkShiftAssignment> filterAssignments(
            @Param("employeeId") Long employeeId,
            @Param("workShiftId") Long workShiftId,
            @Param("month") Long month,
            @Param("year") Long year,
            @Param("departmentId") Long departmentId
    );

    List<WorkShiftAssignment> findByEmployee_IdAndDateAssignBetweenAndWorkShift_IdAndAttendanceIsNull(Long employeeId, LocalDate startDate, LocalDate endDate, Long workShiftId);

    @Query("SELECT " +
            "  wsa.dateAssign AS date, " +
            "  SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END), " +
            "  SUM(CASE WHEN a.status = 'LEAVE' THEN 1 ELSE 0 END), " +
            "  SUM(CASE WHEN a.status = 'LATE' THEN 1 ELSE 0 END), " +
            "  SUM(CASE WHEN a.id IS NULL AND " +
            "               FUNCTION('CURRENT_TIMESTAMP') >= FUNCTION('TIMESTAMP', wsa.dateAssign, wsa.workShift.endTime) " +
            "           THEN 1 ELSE 0 END), " +
            "  COUNT(wsa) AS total " +
            "FROM WorkShiftAssignment wsa " +
            "LEFT JOIN wsa.attendance a " +
            "WHERE wsa.dateAssign BETWEEN :startDate AND :endDate " +
            "GROUP BY wsa.dateAssign " +
            "ORDER BY wsa.dateAssign")
    List<Object[]> getStatisticByDateAssignBetween(LocalDate startDate, LocalDate endDate);


    @Query("SELECT wsa " +
            "FROM WorkShiftAssignment wsa " +
            "LEFT JOIN wsa.attendance a " +
            "WHERE (:employeeName IS NULL OR LOWER(wsa.employee.fullName) LIKE LOWER(CONCAT('%', :employeeName, '%'))) " +
            "AND (:date IS NULL OR wsa.dateAssign = :date) " +
            "AND ( " +
            "     (wsa.dateAssign < CURRENT_DATE) " +
            "     OR " +
            "     (wsa.dateAssign = CURRENT_DATE AND wsa.workShift.endTime <= CURRENT TIME) " +
            ") " +
            "AND (:status IS NULL OR a.status = :status ) ")
    Page<WorkShiftAssignment> getAllWorkShiftAttendanceByFilter(@Param("employeeName") String employeeName,
                                                                @Param("date") LocalDate date,
                                                                @Param("status") AttendanceStatus status,
                                                                Pageable pageable);

    @Query("SELECT wsa " +
            "FROM WorkShiftAssignment wsa " +
            "LEFT JOIN wsa.attendance a " +
            "WHERE (:employeeName IS NULL OR LOWER(wsa.employee.fullName) LIKE LOWER(CONCAT('%', :employeeName, '%'))) " +
            "AND (:date IS NULL OR wsa.dateAssign = :date) " +
            "AND ( " +
            "     (wsa.dateAssign < CURRENT_DATE) " +
            "     OR " +
            "     (wsa.dateAssign = CURRENT_DATE AND wsa.workShift.endTime <= CURRENT TIME) " +
            ") " +
            "AND a.id IS NULL")
    Page<WorkShiftAssignment> getAllWorkShiftAttendanceByFilterAndAbsent(@Param("employeeName") String employeeName,
                                                                @Param("date") LocalDate date,
                                                                Pageable pageable);


}