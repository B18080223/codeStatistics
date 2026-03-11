package com.example.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 提交记录 DTO
 */
@Getter
@Setter
@Builder
public class CommitRecordDTO {

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
