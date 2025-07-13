package com.attendance.fpt.repositories;

import com.attendance.fpt.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    Optional<Article> findBySlug(String slug);
    boolean existsByTitle(String title);

    @Query("select a from Article a " +
            "where (:title is null or lower(a.title) like lower(concat('%', :title, '%'))) " +
            "and (:isActive is null or a.isActive = :isActive) " +
            "and (:createdDate is null or function('date', a.createdAt) = :createdDate)")
    Page<Article> findAllWithFilters(@Param("isActive") Boolean isActive,
                                     @Param("title") String title,
                                     @Param("createdDate") LocalDate createdDate,
                                     Pageable pageable);

}
