package com.attendance.fpt.entity;

import com.attendance.fpt.enums.ComplaintStatus;
import lombok.*;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "complaints")
@NoArgsConstructor
@AllArgsConstructor
public class Complaints {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String reason;
    private LocalDateTime resolveDate;
    private LocalDate date;
    private String responseNote;
    private String responseBy;

    
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
    
    @Enumerated(EnumType.STRING)
    private ComplaintStatus status;
} 