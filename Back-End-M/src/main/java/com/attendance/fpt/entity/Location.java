package com.attendance.fpt.entity;

import lombok.*;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "locations")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String address;
    private String country;
    private Double latitude;
    private Double longitude;
    private Long radius;
    private boolean active;
    
    @OneToMany(mappedBy = "location")
    private List<Attendance> attendances;
} 