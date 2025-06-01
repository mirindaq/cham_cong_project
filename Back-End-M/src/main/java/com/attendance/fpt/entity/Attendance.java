package com.attendance.fpt.entity;

import com.attendance.fpt.enums.AttendanceStatus;
import lombok.*;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "attendances")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private double totalHours;
    private Integer lateMinutes;
    private boolean edited;
    private String editedBy;
    private boolean locked;
    
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
    
    @OneToOne
    @JoinColumn(name = "work_shift_assignment_id")
    private WorkShiftAssignment workShiftAssignment;
    
    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;

    @ManyToOne
    @JoinColumn(name = "leave_request_id")
    private LeaveRequest leaveRequest;
    
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;
} 