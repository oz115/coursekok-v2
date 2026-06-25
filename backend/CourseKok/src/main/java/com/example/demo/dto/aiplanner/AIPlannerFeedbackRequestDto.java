package com.example.demo.dto.aiplanner;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AIPlannerFeedbackRequestDto {
    private Map<String, Object> plan;
    private String message;
    private List<ChatMessage> messages;
    private int headcount;
    private String transportation;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessage {
        private String role;
        private String text;
    }
}
