package com.attendance.fpt.model.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@Builder
public class ResponseError {
    private Date timestamp;
    private Integer status;
    private String error;
    private String path;
    private String message;
}
