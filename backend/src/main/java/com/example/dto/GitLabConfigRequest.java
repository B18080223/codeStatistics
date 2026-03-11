package com.example.dto;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

/**
 * GitLab 配置请求 DTO
 */
@Getter
@Setter
public class GitLabConfigRequest {

    @NotBlank(message = "GitLab 服务器地址不能为空")
    @Pattern(regexp = "^https?://.*", message = "服务器地址格式无效")
    private String serverUrl;

    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "访问令牌不能为空")
    private String token;
}
