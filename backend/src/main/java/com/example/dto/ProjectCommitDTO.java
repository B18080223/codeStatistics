package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * 项目提交统计 DTO
 */
@Getter
@Setter
@AllArgsConstructor
public class ProjectCommitDTO {

    private Long projectId;
    private String projectName;
    private int commitCount;
}
