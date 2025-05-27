package com.attendance.fpt.entity;

import com.attendance.fpt.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "accounts")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String password;
    
    @OneToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    
    private boolean firstLogin;
    
    @Enumerated(EnumType.STRING)
    private Role role;
} 