package com.attendance.fpt.entity;

import lombok.*;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "leave_types")
@NoArgsConstructor
@AllArgsConstructor
public class LeaveType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private Integer maxDayPerYear;
    
    @OneToMany(mappedBy = "leaveType")
    private List<LeaveRequest> leaveRequests;
    
    @OneToMany(mappedBy = "leaveType")
    private List<LeaveBalance> leaveBalances;
} 