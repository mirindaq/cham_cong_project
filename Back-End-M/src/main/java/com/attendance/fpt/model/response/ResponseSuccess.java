package com.attendance.fpt.model.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
@Setter
public class ResponseSuccess<T> {

    private final int status;
    private final String message;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final T data;

    public ResponseSuccess(HttpStatus httpStatus, String message, T data) {
        this.message = message;
        this.status = httpStatus.value();
        this.data = data;
    }

}
