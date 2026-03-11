package com.example.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * GitLab 配置验证响应 DTO
 */
@Getter
@Setter
@Builder
public class ConfigResponse {

    private boolean success;
    private String message;
    private Long userId;
    private String userName;
}
