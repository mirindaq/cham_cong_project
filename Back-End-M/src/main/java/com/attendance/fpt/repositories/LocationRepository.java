package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
     List<Location> findByActive(boolean active);

    Optional<Location> findByName(String name);
}