package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.ArticleRequest;
import com.attendance.fpt.model.response.ArticleResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.services.ArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/articles")
@RequiredArgsConstructor
public class ArticleController {
    private final ArticleService articleService;

    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_DEPARTMENT_LEAD')")
    public ResponseEntity<ResponseSuccess<ArticleResponse>> createArticle(@Valid @RequestBody ArticleRequest articleRequest){

        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Get all attendance success",
                articleService.createArticle(articleRequest)
        ));
    }

    @GetMapping("")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<ArticleResponse>>>> getAllArticles(@RequestParam(defaultValue = "1") int page,
                                                                                                        @RequestParam(defaultValue = "5") int limit,
                                                                                                        @RequestParam(required = false) Boolean isActive,
                                                                                                        @RequestParam(required = false) String title,
                                                                                                        @RequestParam(required = false) LocalDate createdDate){

        return ResponseEntity.ok(new ResponseSuccess<>(
                        OK,
                "Get all articles successfully",
                        articleService.getAllArticles(page, limit, isActive, title, createdDate)
                )
        );

    }
    @GetMapping("/{slug}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResponseSuccess<ArticleResponse>> getArticleBySlug(@PathVariable String slug){

        return ResponseEntity.ok(new ResponseSuccess<>(
                        OK,
                "Get article by slug successfully",
                articleService.getArticleBySlug(slug)
                )
        );
    }

    @PutMapping("/{slug}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_DEPARTMENT_LEAD')")
    public ResponseEntity<ResponseSuccess<ArticleResponse>> updateArticle(@PathVariable String slug,
                                                         @Valid @RequestBody ArticleRequest articleRequest){

        return ResponseEntity.ok(new ResponseSuccess<>(
                        OK,
                "Article updated successfully",
                articleService.updateArticle(slug, articleRequest)
                )
        );
    }

    @PutMapping("/update-status/{id}/{status}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_DEPARTMENT_LEAD')")
    public ResponseEntity<ResponseSuccess<?>> updateArticleStatus(@PathVariable Long id,
                                                                @PathVariable boolean status){
        articleService.updateArticleStatus(id, status);


        return ResponseEntity.ok(new ResponseSuccess<>(
                        OK,
                "Article status updated successfully",
                 null
                )
        );

    }

}
