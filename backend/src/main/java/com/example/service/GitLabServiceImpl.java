package com.example.service;

import com.example.client.GitLabApiClient;
import com.example.client.dto.GitLabCommitResponse;
import com.example.client.dto.GitLabProjectResponse;
import com.example.client.dto.GitLabUserResponse;
import com.example.dto.ConfigResponse;
import com.example.exception.GitLabApiException;
import com.example.model.CommitRecord;
import com.example.model.CommitStats;
import com.example.model.GitLabConfig;
import com.example.model.ProjectCommitInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * GitLab 服务实现类
 *
 * <p>提供 GitLab 配置验证与保存、提交记录获取、统计数据计算等核心业务逻辑。
 * 集成 Caffeine 缓存以减少对 GitLab API 的重复调用。</p>
 *
 * @author example
 * @since 1.0.0
 */
@Slf4j
@Service
public class GitLabServiceImpl implements GitLabService {

    @Autowired
    private GitLabApiClient gitLabApiClient;

    @Autowired
    private CacheManager cacheManager;

    /** 内存中保存的 GitLab 配置 */
    private GitLabConfig currentConfig;

    /**
     * 验证并保存 GitLab 配置
     *
     * <p>调用 GitLab API 验证访问令牌有效性，验证成功后将配置保存到内存中。</p>
     *
     * @param config 配置信息，包含服务器地址、用户名和访问令牌
     * @return 验证结果
     */
    @Override
    public ConfigResponse validateAndSaveConfig(GitLabConfig config) {
        log.info("Validating GitLab config for server: {}", config.getServerUrl());
        try {
            GitLabUserResponse user = gitLabApiClient.validateToken(
                    config.getServerUrl(), config.getToken());

            config.setUserId(user.getId());
            this.currentConfig = config;

            log.info("GitLab config validated successfully, userId: {}", user.getId());
            return ConfigResponse.builder()
                    .success(true)
                    .message("GitLab 连接验证成功")
                    .userId(user.getId())
                    .userName(user.getName())
                    .build();
        } catch (GitLabApiException e) {
            log.error("GitLab config validation failed: {}", e.getMessage());
            return ConfigResponse.builder()
                    .success(false)
                    .message("GitLab 连接验证失败: " + e.getMessage())
                    .build();
        }
    }

    /**
     * 获取指定日期范围内的提交记录
     *
     * <p>遍历用户有权限访问的所有项目，获取每个项目中该用户的提交记录，
     * 并按日期范围过滤。结果会被缓存 5 分钟。</p>
     *
     * @param startDate 开始日期（含）
     * @param endDate 结束日期（含）
     * @return 提交记录列表
     * @throws IllegalStateException 未配置 GitLab 连接时抛出
     */
    @Override
    @Cacheable(value = "gitlabData", key = "'commits:' + #startDate + ':' + #endDate")
    public List<CommitRecord> getCommits(LocalDate startDate, LocalDate endDate) {
        checkConfigExists();
        log.info("Fetching commits from {} to {}", startDate, endDate);

        List<GitLabProjectResponse> projects = gitLabApiClient.listProjects(
                currentConfig.getServerUrl(), currentConfig.getToken());

        List<CommitRecord> allCommits = new ArrayList<>();
        for (GitLabProjectResponse project : projects) {
            try {
                List<GitLabCommitResponse> commits = gitLabApiClient.listCommits(
                        currentConfig.getServerUrl(),
                        currentConfig.getToken(),
                        project.getId(),
                        currentConfig.getUsername(),
                        startDate,
                        endDate);

                for (GitLabCommitResponse commit : commits) {
                    CommitRecord record = convertToCommitRecord(commit, project);
                    if (isWithinDateRange(record.getCommittedDate(), startDate, endDate)) {
                        allCommits.add(record);
                    }
                }
            } catch (GitLabApiException e) {
                log.warn("Failed to fetch commits for project {}: {}",
                        project.getName(), e.getMessage());
            }
        }

        log.info("Fetched {} commits in total", allCommits.size());
        return allCommits;
    }

    /**
     * 获取指定日期范围内的统计汇总数据
     *
     * <p>基于提交记录计算统计指标，包括总提交数、活跃天数、平均每日提交数、
     * 项目数量、每日提交分布和项目提交分布。结果会被缓存 5 分钟。</p>
     *
     * @param startDate 开始日期（含）
     * @param endDate 结束日期（含）
     * @return 统计数据
     */
    @Override
    @Cacheable(value = "gitlabData", key = "'stats:' + #startDate + ':' + #endDate")
    public CommitStats getStats(LocalDate startDate, LocalDate endDate) {
        List<CommitRecord> commits = getCommits(startDate, endDate);
        return calculateStats(commits);
    }

    /**
     * 刷新缓存数据，清除所有已缓存的提交记录和统计数据
     */
    @Override
    public void refreshCache() {
        log.info("Refreshing gitlabData cache");
        org.springframework.cache.Cache cache = cacheManager.getCache("gitlabData");
        if (cache != null) {
            cache.clear();
        }
    }

    /**
     * 检查 GitLab 配置是否已设置
     *
     * @throws IllegalStateException 未配置时抛出
     */
    private void checkConfigExists() {
        if (currentConfig == null) {
            throw new IllegalStateException("GitLab 配置未设置，请先配置 GitLab 连接");
        }
    }

    /**
     * 将 GitLab API 提交响应转换为内部提交记录模型
     *
     * @param response GitLab API 提交响应
     * @param project  所属项目信息
     * @return 内部提交记录
     */
    private CommitRecord convertToCommitRecord(GitLabCommitResponse response,
                                                GitLabProjectResponse project) {
        CommitRecord record = new CommitRecord();
        record.setId(response.getId());
        record.setShortId(response.getShortId());
        record.setTitle(response.getTitle());
        record.setMessage(response.getMessage());
        record.setAuthorName(response.getAuthorName());
        record.setAuthorEmail(response.getAuthorEmail());
        record.setCommittedDate(parseCommittedDate(response.getCommittedDate()));
        record.setProjectId(project.getId());
        record.setProjectName(project.getName());
        return record;
    }

    /**
     * 解析 GitLab API 返回的 ISO 8601 日期字符串
     *
     * @param dateStr ISO 8601 格式日期字符串（如 "2024-01-15T10:30:00.000+08:00"）
     * @return LocalDateTime
     */
    private LocalDateTime parseCommittedDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) {
            return LocalDateTime.now();
        }
        try {
            OffsetDateTime offsetDateTime = OffsetDateTime.parse(dateStr);
            return offsetDateTime.toLocalDateTime();
        } catch (Exception e) {
            log.warn("Failed to parse committed date: {}, using current time", dateStr);
            return LocalDateTime.now();
        }
    }

    /**
     * 判断提交时间是否在指定日期范围内
     *
     * @param committedDate 提交时间
     * @param startDate     开始日期（含）
     * @param endDate       结束日期（含）
     * @return 是否在范围内
     */
    private boolean isWithinDateRange(LocalDateTime committedDate,
                                       LocalDate startDate, LocalDate endDate) {
        LocalDate commitDate = committedDate.toLocalDate();
        return !commitDate.isBefore(startDate) && !commitDate.isAfter(endDate);
    }

    /**
     * 根据提交记录列表计算统计数据
     *
     * @param commits 提交记录列表
     * @return 统计数据
     */
    private CommitStats calculateStats(List<CommitRecord> commits) {
        CommitStats stats = new CommitStats();
        stats.setTotalCommits(commits.size());

        // 计算活跃天数：有提交的唯一日期数
        long activeDays = commits.stream()
                .map(c -> c.getCommittedDate().toLocalDate())
                .distinct()
                .count();
        stats.setActiveDays((int) activeDays);

        // 计算平均每日提交数
        if (activeDays > 0) {
            stats.setAvgDailyCommits((double) commits.size() / activeDays);
        } else {
            stats.setAvgDailyCommits(0);
        }

        // 计算项目数量
        long projectCount = commits.stream()
                .map(CommitRecord::getProjectId)
                .distinct()
                .count();
        stats.setProjectCount((int) projectCount);

        // 按日期分组统计每日提交数
        Map<LocalDate, Integer> dailyCommits = new HashMap<>();
        for (CommitRecord commit : commits) {
            LocalDate date = commit.getCommittedDate().toLocalDate();
            dailyCommits.merge(date, 1, Integer::sum);
        }
        stats.setDailyCommits(dailyCommits);

        // 按项目分组统计项目提交数
        Map<Long, ProjectCommitInfo> projectCommits = new HashMap<>();
        for (CommitRecord commit : commits) {
            projectCommits.compute(commit.getProjectId(), (key, existing) -> {
                if (existing == null) {
                    ProjectCommitInfo info = new ProjectCommitInfo();
                    info.setProjectId(commit.getProjectId());
                    info.setProjectName(commit.getProjectName());
                    info.setCommitCount(1);
                    return info;
                }
                existing.setCommitCount(existing.getCommitCount() + 1);
                return existing;
            });
        }
        stats.setProjectCommits(projectCommits);

        return stats;
    }
}
