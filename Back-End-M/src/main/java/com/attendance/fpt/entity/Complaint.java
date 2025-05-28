package com.attendance.fpt.entity;

import com.attendance.fpt.enums.ComplaintStatus;
import com.attendance.fpt.enums.ComplaintType;
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
@Builder
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String reason;
    private LocalDateTime responseDate;
    private LocalDate date;
    private String responseNote;
    @Enumerated(EnumType.STRING)
    private ComplaintType complaintType;
    private String requestChange;

    @ManyToOne
    @JoinColumn(name = "response_by")
    private Employee responseBy;
    
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
    
    @Enumerated(EnumType.STRING)
    private ComplaintStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

} 