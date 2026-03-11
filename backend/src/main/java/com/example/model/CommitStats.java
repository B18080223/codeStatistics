package com.example.model;

import java.time.LocalDate;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

/**
 * 提交统计汇总内部模型
 */
@Getter
@Setter
public class CommitStats {

    private int totalCommits;

    private int activeDays;

    private double avgDailyCommits;

    private int projectCount;

    private Map<LocalDate, Integer> dailyCommits;

    private Map<Long, ProjectCommitInfo> projectCommits;
}
