package com.example.demo.repository;

import com.example.demo.entity.TripDay;
import com.example.demo.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripDayRepository extends JpaRepository<TripDay, Long> {
    void deleteByTrip(Trip trip);
}
