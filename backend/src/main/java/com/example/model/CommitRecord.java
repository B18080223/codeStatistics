package com.example.model;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

/**
 * 提交记录内部模型
 */
@Getter
@Setter
public class CommitRecord {

    private String id;

    private String shortId;

    private String title;

    private String message;

    private String authorName;

    private String authorEmail;

    private LocalDateTime committedDate;

    private Long projectId;

    private String projectName;
}
