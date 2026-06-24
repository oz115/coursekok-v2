package com.example.demo.dto.trip.collaboration;

import com.example.demo.entity.TripCollaborationComment;

import java.time.LocalDateTime;

public record TripCommentResponse(
        Long id,
        String targetKey,
        String nickname,
        String content,
        TripCollaborationComment.Preference preference,
        LocalDateTime createdAt
) {
    public static TripCommentResponse from(TripCollaborationComment comment) {
        return new TripCommentResponse(
                comment.getId(),
                comment.getTargetKey(),
                comment.getNickname(),
                comment.getContent(),
                comment.getPreference(),
                comment.getCreatedAt()
        );
    }
}
