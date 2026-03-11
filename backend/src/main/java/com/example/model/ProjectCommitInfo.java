package com.example.model;

import lombok.Getter;
import lombok.Setter;

/**
 * 项目提交信息
 */
@Getter
@Setter
public class ProjectCommitInfo {

    private Long projectId;

    private String projectName;

    private int commitCount;
}
