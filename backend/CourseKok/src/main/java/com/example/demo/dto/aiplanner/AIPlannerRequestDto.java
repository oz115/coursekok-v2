package com.example.demo.dto.aiplanner;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AIPlannerRequestDto {
    private LocalDate startDate;
    private LocalDate endDate;
    private int headcount;
    private List<String> travelStyles;
    private String transportation;
    private String additionalRequests;
    private List<Long> savedPlaceIds;
}
