package com.attendance.fpt.entity;

import com.attendance.fpt.enums.LeaveRequestStatus;
import com.attendance.fpt.enums.PartTimeRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "part_time_requests")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartTimeRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "work_shift_id")
    private WorkShift workShift;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private String responseNote;
    private LocalDateTime responseDate;

    @ManyToOne
    @JoinColumn(name = "response_by")
    private Employee responseBy;

    @Enumerated(EnumType.STRING)
    private PartTimeRequestStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

}
