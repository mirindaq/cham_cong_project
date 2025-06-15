package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Attendance;
import com.attendance.fpt.entity.LeaveBalance;
import com.attendance.fpt.enums.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {

    Optional<LeaveBalance> findByEmployee_IdAndLeaveType_IdAndYear(Long employeeId, Long leaveTypeId, Integer year);

    List<LeaveBalance> findAllByEmployee_IdAndYear(Long employeeId, Integer year);

    @Query(" select lb from LeaveBalance  lb" +
            " where lb.employee.id = :employeeId" +
            " and  lb.leaveType.active = true")
    List<LeaveBalance> findByEmployeeIdActive(@Param("employeeId") Long employeeId);


    @Query("""
    SELECT lb FROM LeaveBalance lb
    WHERE (:employeeName IS NULL OR LOWER(lb.employee.fullName) LIKE LOWER(CONCAT('%', :employeeName, '%')))
      AND (:year IS NULL OR lb.year = :year)
      AND (:departmentId IS NULL OR lb.employee.department.id = :departmentId)
       AND (:leaveBalanceType IS NULL OR lb.leaveType.name = :leaveBalanceType)
       AND lb.leaveType.active = true
""")
    Page<LeaveBalance> getAllLeaveBalanceByFilter(@Param("employeeName") String employeeName,
                                                  @Param("year") Long year,
                                                  @Param("departmentId") Long departmentId,
                                                    @Param("leaveBalanceType") String leaveBalanceType,
                                                  Pageable pageable);



}