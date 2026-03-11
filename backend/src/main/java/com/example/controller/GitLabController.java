package com.example.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.CommitRecordDTO;
import com.example.dto.CommitStatsResponse;
import com.example.dto.ConfigResponse;
import com.example.dto.DailyCommitDTO;
import com.example.dto.GitLabConfigRequest;
import com.example.dto.ProjectCommitDTO;
import com.example.model.CommitRecord;
import com.example.model.CommitStats;
import com.example.model.GitLabConfig;
import com.example.model.ProjectCommitInfo;
import com.example.service.GitLabService;

/**
 * GitLab 提交统计 REST 控制器
 *
 * @author example
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/gitlab")
public class GitLabController {

    @Autowired
    private GitLabService gitLabService;

    /**
     * 保存并验证 GitLab 配置
     *
     * @param request 配置请求，包含服务器地址、用户名和访问令牌
     * @return 验证结果
     */
    @PostMapping("/config")
    public ResponseEntity<ConfigResponse> saveConfig(
            @Valid @RequestBody GitLabConfigRequest request) {
        GitLabConfig config = convertToConfig(request);
        ConfigResponse response = gitLabService.validateAndSaveConfig(config);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取提交记录列表
     *
     * @param startDate 开始日期（yyyy-MM-dd 格式）
     * @param endDate 结束日期（yyyy-MM-dd 格式）
     * @return 提交记录列表
     */
    @GetMapping("/commits")
    public ResponseEntity<List<CommitRecordDTO>> getCommits(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        List<CommitRecord> commits = gitLabService.getCommits(startDate, endDate);
        List<CommitRecordDTO> dtoList = commits.stream()
                .map(this::convertToCommitDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    /**
     * 获取统计汇总数据
     *
     * @param startDate 开始日期（yyyy-MM-dd 格式）
     * @param endDate 结束日期（yyyy-MM-dd 格式）
     * @return 统计数据
     */
    @GetMapping("/stats")
    public ResponseEntity<CommitStatsResponse> getStats(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        CommitStats stats = gitLabService.getStats(startDate, endDate);
        CommitStatsResponse response = convertToStatsResponse(stats);
        return ResponseEntity.ok(response);
    }

    private GitLabConfig convertToConfig(GitLabConfigRequest request) {
        GitLabConfig config = new GitLabConfig();
        config.setServerUrl(request.getServerUrl());
        config.setUsername(request.getUsername());
        config.setToken(request.getToken());
        return config;
    }

    private CommitRecordDTO convertToCommitDTO(CommitRecord record) {
        return CommitRecordDTO.builder()
                .id(record.getId())
                .shortId(record.getShortId())
                .title(record.getTitle())
                .message(record.getMessage())
                .authorName(record.getAuthorName())
                .authorEmail(record.getAuthorEmail())
                .committedDate(record.getCommittedDate())
                .projectId(record.getProjectId())
                .projectName(record.getProjectName())
                .build();
    }

    private CommitStatsResponse convertToStatsResponse(CommitStats stats) {
        List<DailyCommitDTO> dailyCommits = convertDailyCommits(stats.getDailyCommits());
        List<ProjectCommitDTO> projectCommits = convertProjectCommits(stats.getProjectCommits());

        return CommitStatsResponse.builder()
                .totalCommits(stats.getTotalCommits())
                .totalChanges(stats.getTotalChanges())
                .avgDailyCommits(stats.getAvgDailyCommits())
                .projectCount(stats.getProjectCount())
                .dailyCommits(dailyCommits)
                .projectCommits(projectCommits)
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    private List<DailyCommitDTO> convertDailyCommits(Map<LocalDate, Integer> dailyCommits) {
        if (dailyCommits == null) {
            return Collections.emptyList();
        }
        return dailyCommits.entrySet().stream()
                .sorted(Comparator.comparing(Map.Entry::getKey))
                .map(entry -> new DailyCommitDTO(entry.getKey().toString(), entry.getValue()))
                .collect(Collectors.toList());
    }

    private List<ProjectCommitDTO> convertProjectCommits(
            Map<Long, ProjectCommitInfo> projectCommits) {
        if (projectCommits == null) {
            return Collections.emptyList();
        }
        return projectCommits.values().stream()
                .sorted(Comparator.comparingInt(ProjectCommitInfo::getCommitCount).reversed())
                .map(info -> new ProjectCommitDTO(
                        info.getProjectId(),
                        info.getProjectName(),
                        info.getCommitCount()))
                .collect(Collectors.toList());
    }
}
