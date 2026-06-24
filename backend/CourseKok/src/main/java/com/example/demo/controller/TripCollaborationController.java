package com.example.demo.controller;

import com.example.demo.dto.trip.collaboration.SharedTripResponse;
import com.example.demo.dto.trip.collaboration.TripCommentRequest;
import com.example.demo.dto.trip.collaboration.TripCommentResponse;
import com.example.demo.service.TripCollaborationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TripCollaborationController {

    private final TripCollaborationService collaborationService;

    @PostMapping("/trips/{tripId}/share")
    public ResponseEntity<SharedTripResponse> createShare(@PathVariable Long tripId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(collaborationService.createOrGetShare(tripId));
    }

    @GetMapping("/trips/{tripId}/share")
    public ResponseEntity<SharedTripResponse> getOwnerShare(@PathVariable Long tripId) {
        return ResponseEntity.ok(collaborationService.getOwnerShare(tripId));
    }

    @GetMapping("/shared-trips/{token}")
    public ResponseEntity<SharedTripResponse> getSharedTrip(@PathVariable String token) {
        return ResponseEntity.ok(collaborationService.getSharedTrip(token));
    }

    @PostMapping("/shared-trips/{token}/comments")
    public ResponseEntity<TripCommentResponse> addComment(
            @PathVariable String token,
            @Valid @RequestBody TripCommentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(collaborationService.addComment(token, request));
    }
}
