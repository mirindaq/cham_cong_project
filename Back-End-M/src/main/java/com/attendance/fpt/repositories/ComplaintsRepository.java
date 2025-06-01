package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Complaint;
import com.attendance.fpt.enums.ComplaintStatus;
import com.attendance.fpt.enums.ComplaintType;
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

public interface ComplaintsRepository extends JpaRepository<Complaint, Long> {
    Page<Complaint> findAllByEmployee_Id(Long employeeId, Pageable pageable);

    @Query("SELECT c FROM Complaint c " +
            "WHERE c.status = :status " +
            "ORDER BY c.createdAt ASC")
    List<Complaint> findByStatusOrderByCreatedAtAsc(@Param("status") ComplaintStatus status);

    @Query("SELECT c FROM Complaint c " +
            "WHERE (:employeeName IS NULL OR LOWER(c.employee.fullName) LIKE LOWER(CONCAT('%', :employeeName, '%'))) " +
            "AND (:startDateTime IS NULL OR c.createdAt >= :startDateTime) " +
            "AND (:endDateTime IS NULL OR c.createdAt <= :endDateTime) " +
            "AND (:departmentId IS NULL OR c.employee.department.id = :departmentId) " +
            "AND (:complaintType IS NULL OR c.complaintType = :complaintType) " +
            "AND (:status IS NULL OR c.status = :status)")
    Page<Complaint> findAllWithFilters(
            @Param("employeeName") String employeeName,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime,
            @Param("departmentId") Long departmentId,
            @Param("complaintType") ComplaintType complaintType,
            @Param("status") ComplaintStatus status,
            Pageable pageable);
}