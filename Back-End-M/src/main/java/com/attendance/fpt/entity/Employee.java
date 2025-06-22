package com.attendance.fpt.entity;

import com.attendance.fpt.enums.EmployeeType;
import lombok.*;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "employees")
@Builder
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String position;
    private boolean active;
    private LocalDate dob;
    private LocalDate joinDate;
    private String avatar;
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToOne(mappedBy = "employee")
    private Account account;

    @Enumerated(EnumType.ORDINAL)
    private EmployeeType employeeType;
    
    @OneToMany(mappedBy = "employee")
    private List<Attendance> attendances;
    
    @OneToMany(mappedBy = "employee")
    private List<LeaveRequest> leaveRequests;
    
    @OneToMany(mappedBy = "employee")
    private List<WorkShiftAssignment> workShiftAssignments;
    
    @OneToMany(mappedBy = "employee")
    private List<Complaint> complaints;

    @OneToMany(mappedBy = "employee")
    private List<LeaveBalance> leaveBalance;
} 