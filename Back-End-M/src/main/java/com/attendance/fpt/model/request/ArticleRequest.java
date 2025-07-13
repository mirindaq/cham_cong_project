package com.attendance.fpt.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ArticleRequest {

    @NotBlank(message = "Title cannot be blank")
    private String title;

    @NotBlank(message = "Thumbnail cannot be blank")
    private String thumbnail;

    @NotBlank(message = "Content cannot be blank")
    private String content;

    private Boolean isActive;


}
