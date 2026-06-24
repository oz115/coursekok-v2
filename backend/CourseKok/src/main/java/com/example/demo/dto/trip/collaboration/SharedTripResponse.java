package com.example.demo.dto.trip.collaboration;

import com.example.demo.entity.Trip;
import com.example.demo.entity.TripCollaborationComment;
import com.example.demo.entity.TripShare;

import java.time.LocalDateTime;
import java.util.List;

public record SharedTripResponse(
        String token,
        Long tripId,
        String title,
        String region,
        String period,
        String style,
        String coverImage,
        String aiPlanSnapshot,
        String ownerNickname,
        LocalDateTime sharedAt,
        List<TripCommentResponse> comments
) {
    public static SharedTripResponse from(
            TripShare share,
            List<TripCollaborationComment> comments
    ) {
        Trip trip = share.getTrip();
        return new SharedTripResponse(
                share.getToken(),
                trip.getId(),
                trip.getTitle(),
                trip.getRegion(),
                trip.getPeriod(),
                trip.getStyle(),
                trip.getCoverImage(),
                trip.getAiPlanSnapshot(),
                trip.getUser().getNickname(),
                share.getCreatedAt(),
                comments.stream().map(TripCommentResponse::from).toList()
        );
    }
}
