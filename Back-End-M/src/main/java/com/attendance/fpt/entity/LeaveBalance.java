package com.attendance.fpt.entity;

import lombok.*;

import jakarta.persistence.*;

@Entity
@Getter
@Setter
@Table(name = "leave_balances")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveBalance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer usedDay;
    private Integer year;
    private Integer remainingDay;
    
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
    
    @ManyToOne
    @JoinColumn(name = "leave_type_id")
    private LeaveType leaveType;
} 