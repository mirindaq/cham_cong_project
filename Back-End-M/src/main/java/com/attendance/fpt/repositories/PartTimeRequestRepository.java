package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.PartTimeRequest;
import com.attendance.fpt.enums.PartTimeRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface PartTimeRequestRepository extends JpaRepository<PartTimeRequest, Long> {
    boolean existsByEmployee_IdAndDateAndWorkShift_Id(Long employeeId, LocalDate date, Long workShiftId);

    @Query("SELECT ptr FROM PartTimeRequest ptr " +
            "WHERE (:employeeName IS NULL OR ptr.employee.fullName = :employeeName) " +
            "AND (:createdDate IS NULL OR FUNCTION('DATE', ptr.createdAt) = :createdDate) " +
            "AND (:requestDate IS NULL OR ptr.date = :requestDate) " +
            "AND (:departmentId IS NULL OR ptr.employee.department.id = :departmentId) " +
            "AND (:workShiftId IS NULL OR ptr.workShift.id = :workShiftId) " +
            "AND (:status IS NULL OR ptr.status = :status)")
    Page<PartTimeRequest> findAllWithFilters(@Param("employeeName") String employeeName,
                                             @Param("createdDate") LocalDate createdDate,
                                             @Param("requestDate") LocalDate requestDate,
                                             @Param("departmentId") Long departmentId,
                                             @Param("workShiftId") Long workShiftId,
                                             @Param("status") PartTimeRequestStatus status,
                                             Pageable pageable);
    Page<PartTimeRequest> findAllByEmployee_Id(Long employeeId, Pageable pageable);

}
