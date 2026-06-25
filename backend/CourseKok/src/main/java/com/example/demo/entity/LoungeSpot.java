package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lounge_spots")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class LoungeSpot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curated_by", nullable = false)
    private User curatedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Badge badge = Badge.RECOMMENDED;

    @Column(name = "curator_note", columnDefinition = "TEXT")
    private String curatorNote;

    @Column(name = "display_order")
    @Builder.Default
    private int displayOrder = 0;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "review_count")
    @Builder.Default
    private int reviewCount = 0;

    @Column(name = "average_rating")
    @Builder.Default
    private double averageRating = 0.0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "loungeSpot", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LoungeReview> reviews = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void update(Badge badge, String curatorNote, int displayOrder, boolean isActive) {
        this.badge = badge;
        this.curatorNote = curatorNote;
        this.displayOrder = displayOrder;
        this.isActive = isActive;
    }

    public void recalculateStats(int reviewCount, double averageRating) {
        this.reviewCount = reviewCount;
        this.averageRating = averageRating;
    }

    public enum Badge {
        POPULAR, RECOMMENDED, SEASONAL
    }
}
