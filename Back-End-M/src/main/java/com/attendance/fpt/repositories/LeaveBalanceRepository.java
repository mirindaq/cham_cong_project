package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {

    Optional<LeaveBalance> findByEmployee_IdAndLeaveType_IdAndYear(Long employeeId, Long leaveTypeId, Integer year);

    List<LeaveBalance> findAllByEmployee_IdAndYear(Long employeeId, Integer year);

    List<LeaveBalance> findByEmployee_Id(Long employeeId);

}