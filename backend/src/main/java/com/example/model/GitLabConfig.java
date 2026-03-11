package com.example.model;

import lombok.Getter;
import lombok.Setter;

/**
 * GitLab 连接配置内部模型
 */
@Getter
@Setter
public class GitLabConfig {

    private String serverUrl;

    private String username;

    private String token;

    private Long userId;
}
