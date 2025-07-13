package com.attendance.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "articles")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", unique = true)
    private String title;

    @Column(name = "slug", unique = true)
    private String slug;

    @Column(name = "thumbnail")
    private String thumbnail;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_active")
    private Boolean isActive;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;


    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
