package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Complaint;
import com.attendance.fpt.entity.LeaveRequest;
import com.attendance.fpt.enums.ComplaintStatus;
import com.attendance.fpt.enums.LeaveRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    Page<LeaveRequest> findAllByEmployee_Id(Long employeeId, Pageable pageable);

    @Query("SELECT lq FROM LeaveRequest lq " +
            "WHERE lq.status = :status " +
            "ORDER BY lq.createdAt ASC")
    List<LeaveRequest> findByStatusOrderByCreatedAtAsc(@Param("status") LeaveRequestStatus status);
}