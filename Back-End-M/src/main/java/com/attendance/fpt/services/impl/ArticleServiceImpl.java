package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.ArticleConverter;
import com.attendance.fpt.entity.Article;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.ArticleRequest;
import com.attendance.fpt.model.response.ArticleResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.repositories.ArticleRepository;
import com.attendance.fpt.services.ArticleService;
import com.attendance.fpt.utils.SecurityUtil;
import com.attendance.fpt.utils.StringUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;


@RequiredArgsConstructor
@Service
@Slf4j(topic = "ARTICLE-SERVICE")
public class ArticleServiceImpl implements ArticleService {
    private final ArticleRepository articleRepository;
    private final SecurityUtil securityUtil;

    @Override
    public ArticleResponse createArticle(ArticleRequest articleRequest) {
        Employee employee = securityUtil.getCurrentUser();

        if(articleRepository.existsByTitle(articleRequest.getTitle())) {
            throw new ConflictException("Article already exists with title: " + articleRequest.getTitle());
        }

        Article article = Article.builder()
                .title(articleRequest.getTitle())
                .slug(StringUtil.normalizeString(articleRequest.getTitle()))
                .thumbnail(articleRequest.getThumbnail())
                .content(articleRequest.getContent())
                .isActive(articleRequest.getIsActive())
                .employee(employee)
                .build();

        return ArticleConverter.convertEntityToResponse(articleRepository.save(article));
    }

    @Override
    public ResponseWithPagination<List<ArticleResponse>> getAllArticles(int page, int limit, Boolean isActive, String title, LocalDate createdDate) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, limit, Sort.by("createdAt").descending());

        Page<Article> articlePage = articleRepository.findAllWithFilters(isActive, title, createdDate, pageable);

        List<ArticleResponse> articleResponses = articlePage.getContent().stream()
                .map(ArticleConverter::convertEntityToResponse)
                .toList();

        return ResponseWithPagination.<List<ArticleResponse>>builder()
                .data(articleResponses)
                .totalItem((int) articlePage.getTotalElements())
                .totalPage(articlePage.getTotalPages())
                .limit(limit)
                .page(page + 1)
                .build();
    }

    @Override
    public ArticleResponse getArticleBySlug(String slug) {
        Article article = findBySlug(slug);
        return ArticleConverter.convertEntityToResponse(article);
    }

    @Override
    @Transactional
    public ArticleResponse updateArticle(String slug, ArticleRequest articleRequest) {
        Article article = findBySlug(slug);
        Employee employee = securityUtil.getCurrentUser();

        article.setTitle(articleRequest.getTitle());
        article.setThumbnail(articleRequest.getThumbnail());
        article.setContent(articleRequest.getContent());
        article.setIsActive(articleRequest.getIsActive());
        article.setEmployee(employee);

        return ArticleConverter.convertEntityToResponse(articleRepository.save(article));
    }

    @Override
    public void updateArticleStatus(Long id, Boolean isActive) {
        Article article = findById(id);
        article.setIsActive(isActive);
        articleRepository.save(article);
    }

    private Article findById(Long id){
        return articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + id));
    }

    private Article findBySlug(String slug){
        return articleRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with slug: " + slug));
    }
}

