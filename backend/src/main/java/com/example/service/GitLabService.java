package com.example.service;

import java.time.LocalDate;
import java.util.List;

import com.example.dto.ConfigResponse;
import com.example.model.CommitRecord;
import com.example.model.CommitStats;
import com.example.model.GitLabConfig;

/**
 * GitLab 服务接口，提供配置验证、提交记录获取和统计数据计算功能
 *
 * @author example
 * @since 1.0.0
 */
public interface GitLabService {

    /**
     * 验证并保存 GitLab 配置
     *
     * @param config 配置信息，包含服务器地址、用户名和访问令牌
     * @return 验证结果，包含是否成功、消息和用户信息
     */
    ConfigResponse validateAndSaveConfig(GitLabConfig config);

    /**
     * 获取指定日期范围内的提交记录
     *
     * @param startDate 开始日期（含）
     * @param endDate 结束日期（含）
     * @return 提交记录列表
     */
    List<CommitRecord> getCommits(LocalDate startDate, LocalDate endDate);

    /**
     * 获取指定日期范围内的统计汇总数据
     *
     * @param startDate 开始日期（含）
     * @param endDate 结束日期（含）
     * @return 统计数据，包含总提交数、活跃天数、平均每日提交数等
     */
    CommitStats getStats(LocalDate startDate, LocalDate endDate);

    /**
     * 检查 GitLab 配置是否已存在
     *
     * @return true 表示已配置
     */
    boolean isConfigured();

    /**
     * 刷新缓存数据，清除所有已缓存的提交记录和统计数据
     */
    void refreshCache();
}
