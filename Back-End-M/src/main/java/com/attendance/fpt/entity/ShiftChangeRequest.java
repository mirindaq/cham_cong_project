package com.attendance.fpt.entity;

import com.attendance.fpt.enums.ShiftChangeRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "shift_change_requests")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    private String reason;

    private String responseNote;

    private LocalDateTime responseDate;

    @ManyToOne
    @JoinColumn(name = "work_shift_id")
    private WorkShift workShift;

    @ManyToOne
    @JoinColumn(name = "target_employee_id")
    private Employee targetEmployee;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "response_by")
    private Employee responseBy;

    @Enumerated(EnumType.STRING)
    private ShiftChangeRequestStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
