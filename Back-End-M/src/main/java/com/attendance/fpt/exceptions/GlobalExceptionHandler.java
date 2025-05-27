package com.attendance.fpt.exceptions;

import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.response.ResponseError;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;
import java.util.List;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseError handleValidationException(MethodArgumentNotValidException ex, WebRequest request) {
        List<String> errorMessages = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .toList();
        String errorMessage = String.join(", ", errorMessages);

        return ResponseError.builder()
                .timestamp(new Date())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(errorMessage)
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
    }

    @ExceptionHandler(ConflictException.class)
    @ResponseStatus(CONFLICT)
    public ResponseError handleConflictException(ConflictException e, WebRequest request) {
        return ResponseError.builder()
                .timestamp(new Date())
                .status(CONFLICT.value())
                .error(CONFLICT.getReasonPhrase())
                .path(request.getDescription(false).replace("uri=", ""))
                .message(e.getMessage())
                .build();
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(NOT_FOUND)
    public ResponseError handleDataNotFoundException(ResourceNotFoundException e , WebRequest request){
        return ResponseError.builder()
                .timestamp(new Date())
                .status(NOT_FOUND.value())
                .error(NOT_FOUND.getReasonPhrase())
                .path(request.getDescription(false).replace("uri=", ""))
                .message(e.getMessage())
                .build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseError handleIllegalArgumentException(IllegalArgumentException e, WebRequest request) {
        return ResponseError.builder()
                .timestamp(new Date())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .path(request.getDescription(false).replace("uri=", ""))
                .message(e.getMessage())
                .build();
    }


}
