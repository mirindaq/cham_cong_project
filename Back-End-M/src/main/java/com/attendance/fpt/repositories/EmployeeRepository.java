package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    @Query("SELECT e FROM Employee e " +
            " JOIN e.account a" +
            " WHERE a.username = :username AND a.password = :password")
    Employee findByUsernameAndPassword(@Param("username") String username,
                                       @Param("password") String password);

    Optional<Employee> findByEmail(String email);

    @Query("SELECT e FROM Employee e " +
           "WHERE (:name IS NULL OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:email IS NULL OR LOWER(e.email) LIKE LOWER(CONCAT('%', :email, '%'))) " +
           "AND (:phone IS NULL OR e.phone LIKE CONCAT('%', :phone, '%')) " +
           "AND (:role IS NULL OR e.account.role = :role) " +
           "AND (:status IS NULL OR e.active = CASE WHEN :status = 'active' THEN true ELSE false END) " +
           "AND (:departmentName IS NULL OR e.department.name = :departmentName)")
    Page<Employee> findAllWithFilters(
        @Param("name") String name,
        @Param("email") String email,
        @Param("phone") String phone,
        @Param("role") Role role,
        @Param("status") String status,
        @Param("departmentName") String departmentName,
        Pageable pageable
    );

    List<Employee> findAllByAccount_Role(Role role);
}
