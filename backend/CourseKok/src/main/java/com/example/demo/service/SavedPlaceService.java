package com.example.demo.service;

import com.example.demo.dto.place.PlaceSummaryResponse;
import com.example.demo.dto.savedplace.SavedPlaceResponse;
import com.example.demo.entity.Place;
import com.example.demo.entity.SavedPlace;
import com.example.demo.entity.User;
import com.example.demo.exception.DuplicateSavedPlaceException;
import com.example.demo.repository.PlaceRepository;
import com.example.demo.repository.SavedPlaceRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SavedPlaceService {

    private final SavedPlaceRepository savedPlaceRepository;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;

    public Page<SavedPlaceResponse> getSavedPlaces(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));

        return savedPlaceRepository.findByUser(user, pageable)
                .map(saved -> {
                    Place place = saved.getPlace();
                    PlaceSummaryResponse placeSummary = new PlaceSummaryResponse(
                            place.getId(),
                            place.getContentTypeId(),
                            place.getTitle(),
                            place.getAddress(),
                            place.getRegionCode().getLdongRegnNm(),
                            place.getRegionCode().getLdongSignguNm(),
                            place.getMapX(),
                            place.getMapY(),
                            place.getFirstImage(),
                            place.getFirstImage2(),
                            place.getViews(),
                            place.getRating()
                    );
                    return new SavedPlaceResponse(saved.getId(), placeSummary, saved.getCreatedAt());
                });
    }

    @Transactional
    public SavedPlaceResponse savePlace(String email, Long placeId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));

        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new NoSuchElementException("장소를 찾을 수 없습니다."));

        if (savedPlaceRepository.existsByUserAndPlace(user, place)) {
            throw new DuplicateSavedPlaceException("이미 바구니에 담긴 장소입니다.");
        }

        SavedPlace savedPlace = SavedPlace.builder()
                .user(user)
                .place(place)
                .build();

        SavedPlace saved = savedPlaceRepository.save(savedPlace);

        PlaceSummaryResponse placeSummary = new PlaceSummaryResponse(
                place.getId(),
                place.getContentTypeId(),
                place.getTitle(),
                place.getAddress(),
                place.getRegionCode().getLdongRegnNm(),
                place.getRegionCode().getLdongSignguNm(),
                place.getMapX(),
                place.getMapY(),
                place.getFirstImage(),
                place.getFirstImage2(),
                place.getViews(),
                place.getRating()
        );

        return new SavedPlaceResponse(saved.getId(), placeSummary, saved.getCreatedAt());
    }

    @Transactional
    public void deletePlace(String email, Long placeId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));

        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new NoSuchElementException("장소를 찾을 수 없습니다."));

        SavedPlace savedPlace = savedPlaceRepository.findByUserAndPlace(user, place)
                .orElseThrow(() -> new NoSuchElementException("바구니에 존재하지 않는 장소입니다."));

        savedPlaceRepository.delete(savedPlace);
    }
}
