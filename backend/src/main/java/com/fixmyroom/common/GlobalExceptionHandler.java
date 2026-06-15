package com.fixmyroom.common;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
        List<ApiError.FieldErrorDetail> fieldErrors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toFieldErrorDetail)
                .toList();

        return buildResponse(HttpStatus.BAD_REQUEST, "Validation failed.", fieldErrors, null);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, ConstraintViolationException.class})
    ResponseEntity<ApiError> handleBadRequest(Exception exception) {
        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Request body is invalid or has the wrong data type.",
                List.of(),
                exception
        );
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiError> handleResponseStatus(ResponseStatusException exception) {
        HttpStatus status = HttpStatus.resolve(exception.getStatusCode().value());
        HttpStatus resolvedStatus = status == null ? HttpStatus.INTERNAL_SERVER_ERROR : status;
        String message = exception.getReason() == null ? "Request failed." : exception.getReason();
        return buildResponse(resolvedStatus, message, List.of(), resolvedStatus.is5xxServerError() ? exception : null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException exception) {
        return buildResponse(HttpStatus.FORBIDDEN, "You do not have permission for this action.", List.of(), null);
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiError> handleAuthentication(AuthenticationException exception) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Authentication is required.", List.of(), null);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> handleUnexpected(Exception exception) {
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Something failed while processing the request.",
                List.of(),
                exception
        );
    }

    private ApiError.FieldErrorDetail toFieldErrorDetail(FieldError fieldError) {
        return new ApiError.FieldErrorDetail(fieldError.getField(), fieldError.getDefaultMessage());
    }

    private ResponseEntity<ApiError> buildResponse(
            HttpStatus status,
            String message,
            List<ApiError.FieldErrorDetail> fieldErrors,
            Exception exception
    ) {
        String errorId = UUID.randomUUID().toString();
        if (exception != null) {
            log.error("API error {} - {}", errorId, message, exception);
        }

        return ResponseEntity.status(status).body(new ApiError(
                errorId,
                message,
                fieldErrors,
                Instant.now()
        ));
    }
}
