package com.example.demo.controller;

import com.example.demo.dto.aiplanner.AIPlannerRequestDto;
import com.example.demo.dto.aiplanner.AIPlannerFeedbackRequestDto;
import com.example.demo.service.AIPlannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "AI Planner API", description = "AI 기반 여행지 추천 및 코스 생성 API")
@RestController
@RequestMapping("/api/ai-planner")
@RequiredArgsConstructor
public class AIPlannerController {

    private final AIPlannerService aiPlannerService;

    @Operation(summary = "AI 여행 코스 추천 받기", description = "유저의 조건들과 바구니에 담은 장소들을 기반으로 AI에게 코스를 추천받습니다.")
    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getAICourse(@RequestBody AIPlannerRequestDto requestDto) {
        String result = aiPlannerService.generateTravelCourse(requestDto);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(result);
    }

    @Operation(summary = "수동 여행 계획 AI 피드백", description = "사용자가 직접 작성한 여행 계획을 바탕으로 AI가 채팅 답변과 수정된 계획을 반환합니다.")
    @PostMapping(value = "/feedback", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getPlanFeedback(@RequestBody AIPlannerFeedbackRequestDto requestDto) {
        String result = aiPlannerService.generatePlanFeedback(requestDto);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(result);
    }
}
