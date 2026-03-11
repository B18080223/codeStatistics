package com.example.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 提交统计汇总响应 DTO
 */
@Getter
@Setter
@Builder
public class CommitStatsResponse {

    private int totalCommits;
    private int activeDays;
    private double avgDailyCommits;
    private int projectCount;
    private List<DailyCommitDTO> dailyCommits;
    private List<ProjectCommitDTO> projectCommits;
    private LocalDateTime lastUpdated;
}
