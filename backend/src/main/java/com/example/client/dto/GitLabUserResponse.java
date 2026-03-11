package com.example.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

/**
 * GitLab API 用户信息响应模型
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class GitLabUserResponse {

    private Long id;
    private String username;
    private String name;
    private String email;
}
