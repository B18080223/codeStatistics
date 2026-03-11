package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * 每日提交统计 DTO
 */
@Getter
@Setter
@AllArgsConstructor
public class DailyCommitDTO {

    private String date;
    private int count;
}
