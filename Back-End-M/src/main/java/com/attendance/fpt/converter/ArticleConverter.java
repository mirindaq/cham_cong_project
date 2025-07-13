package com.attendance.fpt.converter;

import com.attendance.fpt.entity.Article;

import com.attendance.fpt.model.response.ArticleResponse;

public class ArticleConverter {


    public static ArticleResponse convertEntityToResponse(Article article) {
        return ArticleResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .thumbnail(article.getThumbnail())
                .content(article.getContent())
                .createdAt(article.getCreatedAt())
                .isActive(article.getIsActive())
                .employeeName(article.getEmployee().getFullName())
                .build();
    }
}
