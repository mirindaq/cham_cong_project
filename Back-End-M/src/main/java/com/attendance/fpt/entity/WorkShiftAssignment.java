package com.attendance.fpt.entity;

import lombok.*;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "shift_assignments")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkShiftAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private LocalDate dateAssign;

    private boolean locked;
    
    @ManyToOne
    @JoinColumn(name = "work_shift_id")
    private WorkShift workShift;
    
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
    
    @OneToOne(mappedBy = "workShiftAssignment")
    private Attendance attendance;

    private boolean reminderSent;

    @PrePersist
    protected void onCreate() {
        this.locked = false;
        this.reminderSent = false;
    }
} 