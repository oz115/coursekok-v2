package com.example.demo.dto.trip.collaboration;

import com.example.demo.entity.TripCollaborationComment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TripCommentRequest(
        @NotBlank @Size(max = 100) String targetKey,
        @NotBlank @Size(max = 30) String nickname,
        @NotBlank @Size(max = 500) String content,
        @NotNull TripCollaborationComment.Preference preference
) {
}
