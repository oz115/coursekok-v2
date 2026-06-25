package com.example.demo.repository;

import com.example.demo.entity.LoungeSpot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoungeSpotRepository extends JpaRepository<LoungeSpot, Long> {

    Page<LoungeSpot> findByIsActiveTrueOrderByDisplayOrderAscCreatedAtDesc(Pageable pageable);

    Page<LoungeSpot> findByIsActiveTrueAndBadgeOrderByDisplayOrderAscCreatedAtDesc(
            LoungeSpot.Badge badge, Pageable pageable);

    List<LoungeSpot> findAllByOrderByDisplayOrderAscCreatedAtDesc();
}
