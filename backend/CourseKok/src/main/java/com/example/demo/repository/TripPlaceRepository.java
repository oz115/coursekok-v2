package com.example.demo.repository;

import com.example.demo.entity.TripPlace;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripPlaceRepository extends JpaRepository<TripPlace, Long> {
}
