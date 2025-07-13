package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.ShiftChangeRequest;
import com.attendance.fpt.enums.RevertLeaveRequestStatus;
import com.attendance.fpt.enums.ShiftChangeRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;

public interface ShiftChangeRequestRepository extends JpaRepository<ShiftChangeRequest, Long> {
    Page<ShiftChangeRequest> findAllByEmployee_Id(Long employeeId, Pageable pageable);

    Page<ShiftChangeRequest> findAllByTargetEmployee_Id(Long targetEmployeeId, Pageable pageable);


    @Query("SELECT scr FROM ShiftChangeRequest scr " +
            "WHERE (:employeeName IS NULL OR scr.employee.fullName = :employeeName) " +
            "AND (:createdDate IS NULL OR FUNCTION('DATE', scr.createdAt) = :createdDate) " +
            "AND (:departmentId IS NULL OR scr.employee.department.id = :departmentId) " +
            "AND (:workShiftId IS NULL OR scr.workShift.id = :workShiftId) " +
            "AND (:status IS NULL OR scr.status = :status) " +
            "AND (:date IS NULL OR scr.date = :date)")
    Page<ShiftChangeRequest> findAllWithFilters(@Param("employeeName") String employeeName,
                                                @Param("createdDate") LocalDate createdDate,
                                                @Param("date") LocalDate date,
                                                @Param("departmentId") Long departmentId,
                                                @Param("workShiftId") Long workShiftId,
                                                @Param("status") ShiftChangeRequestStatus status, Pageable pageable);

    Page<ShiftChangeRequest> findAllByTargetEmployee_IdAndStatusNotIn(Long targetEmployeeId, Collection<ShiftChangeRequestStatus> statuses, Pageable pageable);
}
