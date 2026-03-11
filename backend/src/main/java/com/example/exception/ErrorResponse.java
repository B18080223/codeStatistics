package com.example.exception;

import lombok.Getter;
import lombok.Setter;

/**
 * 统一错误响应
 */
@Getter
@Setter
public class ErrorResponse {

    private String message;

    public ErrorResponse(String message) {
        this.message = message;
    }
}
