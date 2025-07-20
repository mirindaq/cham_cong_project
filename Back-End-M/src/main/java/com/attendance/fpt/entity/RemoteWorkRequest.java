package com.attendance.fpt.entity;

import com.attendance.fpt.enums.RemoteWorkRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "remote_work_requests")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RemoteWorkRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private String reason;

    private String responseNote;

    private LocalDateTime responseDate;

    @ManyToOne
    @JoinColumn(name = "work_shift_id")
    private WorkShift workShift;

    @ManyToOne
    @JoinColumn(name = "response_by")
    private Employee responseBy;

    @Enumerated(EnumType.STRING)
    private RemoteWorkRequestStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
