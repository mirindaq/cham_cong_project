package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.RemoteWorkRequest;
import com.attendance.fpt.enums.PartTimeRequestStatus;
import com.attendance.fpt.enums.RemoteWorkRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface RemoteWorkRequestRepository extends JpaRepository<RemoteWorkRequest, Long> {

    @Query("SELECT ptr FROM RemoteWorkRequest ptr " +
            "WHERE (:employeeName IS NULL OR ptr.employee.fullName = :employeeName) " +
            "AND (:createdDate IS NULL OR FUNCTION('DATE', ptr.createdAt) = :createdDate) " +
            "AND (:requestDate IS NULL OR ptr.date = :requestDate) " +
            "AND (:departmentId IS NULL OR ptr.employee.department.id = :departmentId) " +
            "AND (:workShiftId IS NULL OR ptr.workShift.id = :workShiftId) " +
            "AND (:status IS NULL OR ptr.status = :status)")
    Page<RemoteWorkRequest> findAllWithFilters(@Param("employeeName") String employeeName,
                                             @Param("createdDate") LocalDate createdDate,
                                             @Param("requestDate") LocalDate requestDate,
                                             @Param("departmentId") Long departmentId,
                                             @Param("workShiftId") Long workShiftId,
                                             @Param("status") RemoteWorkRequestStatus status,
                                             Pageable pageable);

    Page<RemoteWorkRequest> findAllByEmployee_Id(Long employeeId, Pageable pageable);

}
