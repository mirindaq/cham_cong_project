package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Notification;
import com.attendance.fpt.model.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification,Integer> {

    Page<Notification> findAllByEmployee_Id(Long employeeId, Pageable pageable);

    long countByEmployee_IdAndIsRead(Long employeeId, Boolean isRead);

    Optional<Notification> findByIdAndEmployee_Id(Long id, Long employeeId);

    List<Notification> findAllByEmployee_IdAndIsRead(Long employeeId, Boolean isRead);
}
