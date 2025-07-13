package com.attendance.fpt.model.response;

import com.attendance.fpt.entity.Article;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ArticleResponse {
    private Long id;
    private String title;
    private String slug;
    private String thumbnail;
    private String content;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private String employeeName;

}
