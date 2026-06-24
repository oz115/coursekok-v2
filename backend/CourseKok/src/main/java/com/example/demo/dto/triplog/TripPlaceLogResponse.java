package com.example.demo.dto.triplog;

import com.example.demo.entity.TripPlaceLog;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "장소별 포토 리뷰 응답")
public record TripPlaceLogResponse(

        Long id,
        String placeTitle,
        String placeCategory,
        String placeImage,
        int visitOrder,
        int dayNumber,
        String reviewContent,
        String imageUrl,
        Double rating
) {
    public static TripPlaceLogResponse from(TripPlaceLog log) {
        String title = log.getPlaceTitle() != null
                ? log.getPlaceTitle()
                : (log.getPlace() != null ? log.getPlace().getTitle() : null);
        String image = log.getPlaceImage() != null
                ? log.getPlaceImage()
                : (log.getPlace() != null ? log.getPlace().getFirstImage() : null);

        return new TripPlaceLogResponse(
                log.getId(),
                title,
                log.getPlaceCategory(),
                image,
                log.getVisitOrder(),
                log.getDayNumber(),
                log.getReviewContent(),
                log.getImageUrl(),
                log.getRating()
        );
    }
}
