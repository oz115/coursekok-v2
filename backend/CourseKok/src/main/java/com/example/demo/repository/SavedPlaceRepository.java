package com.example.demo.repository;

import com.example.demo.entity.SavedPlace;
import com.example.demo.entity.User;
import com.example.demo.entity.Place;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface SavedPlaceRepository extends JpaRepository<SavedPlace, Long> {
    Page<SavedPlace> findByUser(User user, Pageable pageable);
    boolean existsByUserAndPlace(User user, Place place);
    boolean existsByUserIdAndPlaceId(Long userId, Long placeId);
    Optional<SavedPlace> findByUserAndPlace(User user, Place place);
    Optional<SavedPlace> findByUserIdAndPlaceId(Long userId, Long placeId);
    List<SavedPlace> findByUser(User user);
    List<SavedPlace> findByUserId(Long userId);
    void deleteByUserAndPlace(User user, Place place);
    void deleteByUserIdAndPlaceId(Long userId, Long placeId);
}
