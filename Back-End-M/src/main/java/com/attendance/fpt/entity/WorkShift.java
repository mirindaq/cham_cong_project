package com.attendance.fpt.entity;

import lombok.*;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "work_shifts")
@NoArgsConstructor
@AllArgsConstructor
public class WorkShift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    
    @OneToMany(mappedBy = "workShift")
    private List<WorkShiftAssignment> workShiftAssignments;
} 