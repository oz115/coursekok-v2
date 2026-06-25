package com.example.demo.repository;

import com.example.demo.entity.TripDay;
import com.example.demo.entity.Trip;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripDayRepository extends JpaRepository<TripDay, Long> {
    void deleteByTrip(Trip trip);

    @EntityGraph(attributePaths = {"tripPlaces", "tripPlaces.place"})
    List<TripDay> findByTripOrderByDayNumberAsc(Trip trip);
}
