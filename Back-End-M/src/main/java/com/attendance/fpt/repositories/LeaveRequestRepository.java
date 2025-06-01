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
            "JOIN lq.employee e " +
            "LEFT JOIN WorkShiftAssignment wfa ON wfa.employee.id = e.id " +
            "WHERE (:employeeName IS NULL OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :employeeName, '%'))) " +
            "AND (:startDateTime IS NULL OR lq.createdAt >= :startDateTime) " +
            "AND (:endDateTime IS NULL OR lq.createdAt <= :endDateTime) " +
            "AND (:departmentId IS NULL OR e.department.id = :departmentId) " +
            "AND (:workShiftId IS NULL OR wfa.workShift.id = :workShiftId) " +
            "AND (:leaveTypeId IS NULL OR lq.leaveType.id = :leaveTypeId) " +
            "AND (:status IS NULL OR lq.status = :status)")
    Page<LeaveRequest> findAllWithFilters(
            @Param("employeeName") String employeeName,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime,
            @Param("departmentId") Long departmentId,
            @Param("workShiftId") Long workShiftId,
            @Param("leaveTypeId") Long leaveTypeId,
            @Param("status") LeaveRequestStatus status,
            Pageable pageable);
}