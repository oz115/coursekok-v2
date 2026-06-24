package com.example.demo.repository;

import com.example.demo.entity.Trip;
import com.example.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TripRepository extends JpaRepository<Trip, Long> {

    Page<Trip> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<Trip> findByUserOrderByCreatedAtDesc(User user);

    Optional<Trip> findByIdAndUser(Long id, User user);
}
