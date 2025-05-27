package com.attendance.fpt.model.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ResponseWithPagination<T> {
    private T data;
    private int page;
    private int totalPage;
    private int limit;
    private int totalItem;
}
