package com.example.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * GitLab API 项目信息响应模型
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class GitLabProjectResponse {

    private Long id;
    private String name;

    @JsonProperty("path_with_namespace")
    private String pathWithNamespace;

    @JsonProperty("web_url")
    private String webUrl;
}
