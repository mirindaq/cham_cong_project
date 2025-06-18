package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.RevertLeaveRequest;
import com.attendance.fpt.enums.RevertLeaveRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface RevertLeaveRequestRepository extends JpaRepository<RevertLeaveRequest, Long> {


    @Query("SELECT rlq FROM RevertLeaveRequest rlq " +
            "WHERE (:employeeName IS NULL OR rlq.employee.fullName = :employeeName) " +
            "AND (:createdDate IS NULL OR FUNCTION('DATE', rlq.createdAt) = :createdDate) " +
            "AND (:departmentId IS NULL OR rlq.employee.department.id = :departmentId) " +
            "AND (:workShiftId IS NULL OR rlq.workShift.id = :workShiftId) " +
            "AND (:status IS NULL OR rlq.status = :status) " +
            "AND (:date IS NULL OR rlq.date = :date)")
    Page<RevertLeaveRequest> findAllWithFilters(@Param("employeeName") String employeeName,
                                                @Param("createdDate") LocalDate createdDate,
                                                @Param("date") LocalDate date,
                                                @Param("departmentId") Long departmentId,
                                                @Param("workShiftId") Long workShiftId,
                                                @Param("status") RevertLeaveRequestStatus status,
                                                Pageable pageable);


    Page<RevertLeaveRequest> findAllByEmployee_Id(Long employeeId, Pageable pageable);

    boolean existsByEmployee_IdAndDateAndWorkShift_Id(Long employeeId, LocalDate date, Long workShiftId);
}
