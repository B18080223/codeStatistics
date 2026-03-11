package com.example.exception;

/**
 * GitLab API 调用异常
 */
public class GitLabApiException extends RuntimeException {

    private final int statusCode;

    public GitLabApiException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
