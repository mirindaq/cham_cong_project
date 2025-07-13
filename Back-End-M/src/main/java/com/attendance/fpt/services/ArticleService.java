package com.attendance.fpt.services;

import com.attendance.fpt.model.request.ArticleRequest;
import com.attendance.fpt.model.response.ArticleResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;

import java.time.LocalDate;
import java.util.List;

public interface ArticleService {
    ArticleResponse createArticle(ArticleRequest articleRequest);
    ResponseWithPagination<List<ArticleResponse>> getAllArticles(int page, int limit, Boolean isActive, String title, LocalDate createdDate);
    ArticleResponse getArticleBySlug(String slug);
    ArticleResponse updateArticle(String slug, ArticleRequest articleRequest);
    void updateArticleStatus(Long id, Boolean isActive);
}
