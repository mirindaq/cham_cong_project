package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {
     List<Location> findByActive(boolean active);
} 