package com.example.client;

import com.example.client.dto.GitLabCommitResponse;
import com.example.client.dto.GitLabProjectResponse;
import com.example.client.dto.GitLabUserResponse;
import com.example.exception.GitLabApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * GitLab API 客户端
 *
 * <p>封装与 GitLab REST API 的通信逻辑，包括用户验证、项目列表获取和提交记录获取。
 * 内置 429 速率限制自动重试机制。</p>
 *
 * @since 1.0.0
 */
@Slf4j
@Component
public class GitLabApiClient {

    private static final String PRIVATE_TOKEN_HEADER = "PRIVATE-TOKEN";
    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 1000L;
    private static final int PER_PAGE = 100;

    private final RestTemplate restTemplate;

    public GitLabApiClient() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * 验证 GitLab 访问令牌并获取用户信息
     *
     * @param serverUrl GitLab 服务器地址
     * @param token     Personal Access Token
     * @return 用户信息
     * @throws GitLabApiException 认证失败或 API 调用异常时抛出
     */
    public GitLabUserResponse validateToken(String serverUrl, String token) {
        String baseUrl = normalizeUrl(serverUrl);
        String url = baseUrl + "/api/v4/user";
        log.info("Validating GitLab token against: {}", baseUrl);

        return executeWithRetry(() -> {
            HttpEntity<Void> entity = new HttpEntity<>(buildHeaders(token));
            ResponseEntity<GitLabUserResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, GitLabUserResponse.class);
            return response.getBody();
        });
    }

    /**
     * 获取用户有权限访问的所有项目列表（自动分页）
     *
     * @param serverUrl GitLab 服务器地址
     * @param token     Personal Access Token
     * @return 项目列表
     * @throws GitLabApiException API 调用异常时抛出
     */
    public List<GitLabProjectResponse> listProjects(String serverUrl, String token) {
        String baseUrl = normalizeUrl(serverUrl);
        log.info("Fetching project list from: {}", baseUrl);
        List<GitLabProjectResponse> allProjects = new ArrayList<>();
        int page = 1;

        while (true) {
            String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/api/v4/projects")
                    .queryParam("membership", true)
                    .queryParam("per_page", PER_PAGE)
                    .queryParam("page", page)
                    .toUriString();

            List<GitLabProjectResponse> pageResult = executeWithRetry(() -> {
                HttpEntity<Void> entity = new HttpEntity<>(buildHeaders(token));
                ResponseEntity<List<GitLabProjectResponse>> response = restTemplate.exchange(
                        url, HttpMethod.GET, entity,
                        new ParameterizedTypeReference<List<GitLabProjectResponse>>() {});
                return response.getBody() != null ? response.getBody() : Collections.emptyList();
            });

            if (pageResult.isEmpty()) {
                break;
            }

            allProjects.addAll(pageResult);

            if (pageResult.size() < PER_PAGE) {
                break;
            }
            page++;
        }

        log.info("Fetched {} projects", allProjects.size());
        return allProjects;
    }

    /**
     * 获取指定项目中某用户在日期范围内的提交记录（自动分页）
     *
     * @param serverUrl GitLab 服务器地址
     * @param token     Personal Access Token
     * @param projectId 项目 ID
     * @param username  提交者用户名（用于过滤 author）
     * @param since     开始日期（包含）
     * @param until     结束日期（包含）
     * @return 提交记录列表
     * @throws GitLabApiException API 调用异常时抛出
     */
    public List<GitLabCommitResponse> listCommits(String serverUrl, String token,
                                                   Long projectId, String username,
                                                   LocalDate since, LocalDate until) {
        String baseUrl = normalizeUrl(serverUrl);
        log.debug("Fetching commits for project {} by user {}", projectId, username);
        List<GitLabCommitResponse> allCommits = new ArrayList<>();
        int page = 1;

        while (true) {
            String url = UriComponentsBuilder
                    .fromHttpUrl(baseUrl + "/api/v4/projects/{id}/repository/commits")
                    .queryParam("author", username)
                    .queryParam("since", since.toString() + "T00:00:00Z")
                    .queryParam("until", until.plusDays(1).toString() + "T00:00:00Z")
                    .queryParam("per_page", PER_PAGE)
                    .queryParam("page", page)
                    .buildAndExpand(projectId)
                    .toUriString();

            List<GitLabCommitResponse> pageResult = executeWithRetry(() -> {
                HttpEntity<Void> entity = new HttpEntity<>(buildHeaders(token));
                ResponseEntity<List<GitLabCommitResponse>> response = restTemplate.exchange(
                        url, HttpMethod.GET, entity,
                        new ParameterizedTypeReference<List<GitLabCommitResponse>>() {});
                return response.getBody() != null ? response.getBody() : Collections.emptyList();
            });

            if (pageResult.isEmpty()) {
                break;
            }

            allCommits.addAll(pageResult);

            if (pageResult.size() < PER_PAGE) {
                break;
            }
            page++;
        }

        log.debug("Fetched {} commits for project {}", allCommits.size(), projectId);
        return allCommits;
    }

    /**
     * 构建包含认证信息的请求头
     *
     * @param token Personal Access Token
     * @return HTTP 请求头
     */
    private HttpHeaders buildHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(PRIVATE_TOKEN_HEADER, token);
        return headers;
    }

    /**
     * 去除服务器地址末尾的斜杠，避免 URL 拼接出现双斜杠
     *
     * @param url 原始 URL
     * @return 规范化后的 URL
     */
    private String normalizeUrl(String url) {
        if (url != null && url.endsWith("/")) {
            return url.substring(0, url.length() - 1);
        }
        return url;
    }

    /**
     * 带速率限制重试的请求执行器
     *
     * <p>当收到 429 状态码时，等待后自动重试，最多重试 {@value MAX_RETRIES} 次。
     * 使用指数退避策略。</p>
     *
     * @param action 要执行的请求操作
     * @param <T>    返回类型
     * @return 请求结果
     * @throws GitLabApiException 超过重试次数或遇到非速率限制错误时抛出
     */
    private <T> T executeWithRetry(ApiAction<T> action) {
        int retries = 0;
        while (true) {
            try {
                return action.execute();
            } catch (HttpClientErrorException e) {
                int statusCode = e.getRawStatusCode();
                if (statusCode == 429 && retries < MAX_RETRIES) {
                    retries++;
                    long delay = RETRY_DELAY_MS * (1L << (retries - 1));
                    log.warn("GitLab API rate limited (429), retry {}/{} after {}ms",
                            retries, MAX_RETRIES, delay);
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new GitLabApiException("Request interrupted during rate limit retry", 429);
                    }
                } else {
                    log.error("GitLab API error: status={}, message={}", statusCode, e.getMessage());
                    throw new GitLabApiException(
                            "GitLab API 调用失败: " + e.getStatusText(), statusCode);
                }
            } catch (RestClientException e) {
                log.error("GitLab API request failed: {}", e.getMessage());
                throw new GitLabApiException("GitLab 服务连接失败: " + e.getMessage(), 0);
            }
        }
    }

    /**
     * 可重试的 API 操作函数式接口
     *
     * @param <T> 返回类型
     */
    @FunctionalInterface
    private interface ApiAction<T> {
        T execute() throws RestClientException;
    }
}
