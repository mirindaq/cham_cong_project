package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Complaint;
import com.attendance.fpt.enums.ComplaintStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ComplaintsRepository extends JpaRepository<Complaint, Long> {
    Page<Complaint> findAllByEmployee_Id(Long employeeId, Pageable pageable);

    @Query("SELECT c FROM Complaint c " +
            "WHERE c.status = :status " +
            "ORDER BY c.createdAt ASC")
    List<Complaint> findByStatusOrderByCreatedAtAsc(@Param("status") ComplaintStatus status);
}