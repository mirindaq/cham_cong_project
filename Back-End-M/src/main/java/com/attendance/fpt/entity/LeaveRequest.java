package com.attendance.fpt.entity;

import com.attendance.fpt.enums.LeaveRequestStatus;
import lombok.*;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "leave_requests")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;

    private String responseNote;
    private LocalDateTime responseDate;

    @ManyToOne
    @JoinColumn(name = "response_by")
    private Employee responseBy;
    
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
    
    @ManyToOne
    @JoinColumn(name = "leave_type_id")
    private LeaveType leaveType;

    @ManyToOne
    @JoinColumn(name = "work_shift_id")
    private WorkShift workShift;
    
    @Enumerated(EnumType.STRING)
    private LeaveRequestStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
} 