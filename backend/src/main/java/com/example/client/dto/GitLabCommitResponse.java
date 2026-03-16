package com.example.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * GitLab API 提交记录响应模型
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class GitLabCommitResponse {

    private String id;

    @JsonProperty("short_id")
    private String shortId;

    private String title;
    private String message;

    @JsonProperty("author_name")
    private String authorName;

    @JsonProperty("author_email")
    private String authorEmail;

    @JsonProperty("committed_date")
    private String committedDate;

    private Stats stats;

    /**
     * GitLab commit stats（additions/deletions/total）
     */
    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Stats {
        private int additions;
        private int deletions;
        private int total;
    }
}
