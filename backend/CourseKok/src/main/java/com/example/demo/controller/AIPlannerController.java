package com.example.demo.controller;

import com.example.demo.dto.aiplanner.AIPlannerRequestDto;
import com.example.demo.dto.aiplanner.AIPlannerFeedbackRequestDto;
import com.example.demo.service.AIPlannerService;
import com.example.demo.service.KakaoMobilityClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@Tag(name = "AI Planner API", description = "AI 기반 여행지 추천 및 코스 생성 API")
@RestController
@RequestMapping("/api/ai-planner")
@RequiredArgsConstructor
public class AIPlannerController {

    private final AIPlannerService aiPlannerService;
    private final KakaoMobilityClient kakaoMobilityClient;

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

    @Operation(summary = "장소 간 카카오 이동 경로 조회", description = "두 좌표 사이의 카카오 모빌리티 경로 vertexes를 반환합니다.")
    @PostMapping(value = "/directions", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getDirections(@RequestBody DirectionsRequest request) {
        Map<String, Object> result = kakaoMobilityClient.getDirections(
                request.originX(),
                request.originY(),
                request.destinationX(),
                request.destinationY()
        );
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(result);
    }

    public record DirectionsRequest(
            BigDecimal originX,
            BigDecimal originY,
            BigDecimal destinationX,
            BigDecimal destinationY
    ) {
    }
}
