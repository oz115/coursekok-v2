package com.example.demo.repository;

import com.example.demo.entity.TripCollaborationComment;
import com.example.demo.entity.TripShare;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripCollaborationCommentRepository extends JpaRepository<TripCollaborationComment, Long> {
    List<TripCollaborationComment> findByTripShareOrderByCreatedAtAsc(TripShare tripShare);
}
