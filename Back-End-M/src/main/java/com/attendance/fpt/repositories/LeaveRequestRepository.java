package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Complaint;
import com.attendance.fpt.entity.LeaveRequest;
import com.attendance.fpt.enums.ComplaintStatus;
import com.attendance.fpt.enums.LeaveRequestStatus;
import com.attendance.fpt.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    Page<LeaveRequest> findAllByEmployee_Id(Long employeeId, Pageable pageable);

    @Query("SELECT lq FROM LeaveRequest lq " +
            "WHERE lq.status = :status " +
            "ORDER BY lq.createdAt ASC")
    List<LeaveRequest> findByStatusOrderByCreatedAtAsc(@Param("status") LeaveRequestStatus status);


    @Query("SELECT DISTINCT lq FROM LeaveRequest lq " +
            "WHERE (:employeeName IS NULL OR LOWER(lq.employee.fullName) LIKE LOWER(CONCAT('%', :employeeName, '%'))) " +
            "AND (:createdDate IS NULL OR FUNCTION('DATE', lq.createdAt) = :createdDate) " +
            "AND (:departmentId IS NULL OR lq.employee.department.id = :departmentId) " +
            "AND (:workShiftId IS NULL OR lq.workShift.id = :workShiftId) " +
            "AND (:leaveTypeId IS NULL OR lq.leaveType.id = :leaveTypeId) " +
            "AND (:status IS NULL OR lq.status = :status)")
    Page<LeaveRequest> findAllWithFilters(
            @Param("employeeName") String employeeName,
            @Param("createdDate") LocalDate createdDate,
            @Param("departmentId") Long departmentId,
            @Param("workShiftId") Long workShiftId,
            @Param("leaveTypeId") Long leaveTypeId,
            @Param("status") LeaveRequestStatus status,
            Pageable pageable);


    @Query("SELECT lt.name as name, count( distinct lq) as value FROM Attendance a" +
            " JOIN a.leaveRequest lq " +
            " JOIN lq.leaveType lt " +
            " GROUP BY lt " )
    List<Object[]> getLeaveOverallStatistics();


    @Query("SELECT lt.name as name, count( distinct lq) as value FROM Attendance a" +
            " JOIN a.leaveRequest lq " +
            " JOIN lq.leaveType lt " +
            "  WHERE (a.workShiftAssignment.dateAssign < CURRENT_DATE " +
            "               OR (a.workShiftAssignment.dateAssign = CURRENT_DATE AND a.workShiftAssignment.workShift.endTime < CURRENT_TIMESTAMP))" +
            "          AND EXTRACT(MONTH FROM a.workShiftAssignment.dateAssign) = :month" +
            "          AND EXTRACT(YEAR FROM a.workShiftAssignment.dateAssign) = :year" +
            " GROUP BY lt " )
    List<Object[]> getLeaveOverallStatisticsByMonth(int month, int year);

}